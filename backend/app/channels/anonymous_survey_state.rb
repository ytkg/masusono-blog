require "securerandom"

class AnonymousSurveyState
  class << self
    def appear(connection_id:, user_id:, name:)
      mutex.synchronize do
        current = participants[connection_id]
        participants[connection_id] = {
          user_id: user_id,
          name: name,
          joined_at: current&.fetch(:joined_at) || Time.current,
          updated_at: Time.current
        }
        snapshot_locked
      end
    end

    def leave(connection_id:)
      mutex.synchronize do
        participant = participants.delete(connection_id)
        remove_vote_if_last_connection_locked(participant[:user_id]) if participant && !revealed_survey?
        handle_missing_questioner_locked(departed_participant: participant) if survey
        auto_reveal_if_absent_questioner_ready_locked if survey
        snapshot_locked
      end
    end

    def start_game(user_id:)
      mutex.synchronize do
        users = users_locked
        questioner = users.first
        return snapshot_locked unless users.size >= 2
        return snapshot_locked unless questioner&.fetch(:userId) == user_id

        self.survey = questioner ? build_asking_survey(questioner: questioner, round: 1) : nil
        snapshot_locked
      end
    end

    def submit_question(user_id:, question:)
      mutex.synchronize do
        return snapshot_locked unless asking_survey? && current_questioner?(user_id)

        survey[:id] = SecureRandom.uuid
        survey[:question] = question
        survey[:phase] = "voting"
        survey[:votes] = {}
        snapshot_locked
      end
    end

    def vote(user_id:, answer:)
      mutex.synchronize do
        return snapshot_locked unless voting_survey?

        survey[:votes][user_id] = answer
        auto_reveal_if_absent_questioner_ready_locked
        snapshot_locked
      end
    end

    def reveal(user_id:)
      mutex.synchronize do
        users = users_locked
        if revealable_by?(user_id, users)
          survey[:result] = result_payload_locked(users)
          survey[:phase] = "revealed"
        end
        snapshot_locked
      end
    end

    def next_question(user_id:)
      mutex.synchronize do
        users = users_locked
        return snapshot_locked unless revealed_survey? && can_advance_to_next_question?(user_id, users)

        advance_to_questioner_locked(next_questioner_for_advance_locked(users), round: survey[:round] + 1)
        snapshot_locked
      end
    end

    def snapshot
      mutex.synchronize { snapshot_locked }
    end

    def reset!
      mutex.synchronize do
        participants.clear
        self.survey = nil
      end
    end

    private

    attr_accessor :survey

    def mutex
      @mutex ||= Mutex.new
    end

    def participants
      @participants ||= {}
    end

    def build_asking_survey(questioner:, round:)
      {
        id: SecureRandom.uuid,
        round: round,
        questioner_user_id: questioner[:userId],
        questioner_name: questioner[:name],
        question: nil,
        phase: "asking",
        votes: {}
      }
    end

    def remove_vote_if_last_connection_locked(user_id)
      return if participants.values.any? { |participant| participant[:user_id] == user_id }

      survey&.fetch(:votes)&.delete(user_id)
    end

    def handle_missing_questioner_locked(departed_participant:)
      return if users_locked.any? { |user| user[:userId] == survey[:questioner_user_id] }

      if next_questioner_assigned?
        refresh_stored_next_questioner_locked(departed_participant)
        return
      end

      if voting_survey? || revealed_survey?
        hold_survey_for_next_questioner_locked(next_questioner_after_departure_locked(departed_participant))
        return
      end

      next_round = asking_survey? ? survey[:round] : survey[:round] + 1
      advance_to_questioner_locked(next_questioner_after_departure_locked(departed_participant), round: next_round)
    end

    def hold_survey_for_next_questioner_locked(questioner)
      unless questioner
        self.survey = nil
        return
      end

      survey[:next_questioner_user_id] = questioner[:userId]
      survey[:next_questioner_name] = questioner[:name]
    end

    def refresh_stored_next_questioner_locked(departed_participant)
      return unless departed_participant&.fetch(:user_id) == survey[:next_questioner_user_id]

      hold_survey_for_next_questioner_locked(next_questioner_after_departure_locked(departed_participant))
    end

    def advance_to_questioner_locked(questioner, round:)
      self.survey = questioner ? build_asking_survey(questioner: questioner, round: round) : nil
    end

    def snapshot_locked
      users = users_locked
      {
        type: "state",
        participants: users,
        survey: survey_payload_locked(users)
      }
    end

    def users_locked
      users_with_joined_at_locked.map { |user| user[:payload] }
    end

    def users_with_joined_at_locked
      participants
        .values
        .group_by { |participant| participant[:user_id] }
        .map do |user_id, grouped|
          {
            joined_at: grouped.map { |participant| participant[:joined_at] }.min,
            payload: user_payload(user_id, grouped)
          }
        end
        .sort_by { |user| user[:joined_at] }
    end

    def user_payload(user_id, grouped)
      latest = grouped.max_by { |participant| participant[:updated_at] }
      {
        userId: user_id,
        name: latest[:name],
        connectionCount: grouped.size
      }
    end

    def next_questioner_locked(users)
      return nil if users.empty?

      current_index = users.index { |user| user[:userId] == survey[:questioner_user_id] } || -1
      users[(current_index + 1) % users.length]
    end

    def next_questioner_for_advance_locked(users)
      return next_questioner_locked(users) if questioner_present_locked?(users)

      stored_next_questioner_locked(users) || users.first
    end

    def next_questioner_after_departure_locked(departed_participant)
      users = users_with_joined_at_locked
      return nil if users.empty?
      return users.first[:payload] unless departed_participant

      next_user = users.find { |user| user[:joined_at] > departed_participant[:joined_at] } || users.first
      next_user[:payload]
    end

    def stored_next_questioner_locked(users)
      user_id = survey[:next_questioner_user_id]
      return nil unless user_id

      users.find { |user| user[:userId] == user_id }
    end

    def next_questioner_assigned?
      survey[:next_questioner_user_id].present?
    end

    def result_payload_locked(users)
      votes = survey[:votes]
      {
        voted_count: votes.size,
        participant_count: users.size,
        yes_count: votes.values.count(true),
        no_count: votes.values.count(false)
      }
    end

    def all_participants_voted_locked(users)
      users.any? && users.all? { |user| survey[:votes].key?(user[:userId]) }
    end

    def auto_reveal_if_absent_questioner_ready_locked
      users = users_locked
      return unless voting_survey?
      return if questioner_present_locked?(users)
      return unless all_participants_voted_locked(users)

      survey[:result] = result_payload_locked(users)
      survey[:phase] = "revealed"
    end

    def asking_survey?
      survey&.fetch(:phase) == "asking"
    end

    def voting_survey?
      survey&.fetch(:phase) == "voting"
    end

    def revealed_survey?
      survey&.fetch(:phase) == "revealed"
    end

    def current_questioner?(user_id)
      survey[:questioner_user_id] == user_id
    end

    def questioner_present_locked?(users)
      users.any? { |user| user[:userId] == survey[:questioner_user_id] }
    end

    def can_advance_to_next_question?(user_id, users)
      if questioner_present_locked?(users)
        return current_questioner?(user_id)
      end

      next_questioner_for_advance_locked(users)&.fetch(:userId) == user_id
    end

    def revealable_by?(user_id, users)
      voting_survey? && current_questioner?(user_id) && all_participants_voted_locked(users)
    end

    def survey_payload_locked(users)
      return nil unless survey

      votes = survey[:votes]
      questioner = users.find { |user| user[:userId] == survey[:questioner_user_id] }
      payload = {
        id: survey[:id],
        round: survey[:round],
        question: survey[:question],
        phase: survey[:phase],
        questioner: {
          userId: survey[:questioner_user_id],
          name: questioner&.fetch(:name) || survey[:questioner_name]
        }
      }
      unless survey[:phase] == "revealed"
        return payload.merge(
          votedCount: votes.size,
          participantCount: users.size
        )
      end

      result = survey[:result] || result_payload_locked(users)
      payload.merge(
        votedCount: result[:voted_count],
        participantCount: result[:participant_count],
        yesCount: result[:yes_count],
        noCount: result[:no_count],
        nextQuestioner: next_questioner_payload_locked(users)
      )
    end

    def next_questioner_payload_locked(users)
      return nil if questioner_present_locked?(users)

      questioner = next_questioner_for_advance_locked(users)
      return nil unless questioner

      {
        userId: questioner[:userId],
        name: questioner[:name]
      }
    end
  end
end
