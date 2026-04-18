require "securerandom"

class AnonymousSurveyChannel < ApplicationCable::Channel
  STREAM_NAME = "anonymous_survey".freeze
  MAX_NAME_LENGTH = 24
  MAX_QUESTION_LENGTH = 120

  def subscribed
    @presence_connection_id = SecureRandom.uuid
    stream_from STREAM_NAME
  end

  def unsubscribed
    broadcast_state(AnonymousSurveyState.leave(connection_id: @presence_connection_id)) if @presence_connection_id
  end

  def appear(data)
    broadcast_state(
      AnonymousSurveyState.appear(
        connection_id: @presence_connection_id,
        user_id: current_user_id,
        name: user_name(data)
      )
    )
  end

  def start_game(_data)
    broadcast_state(AnonymousSurveyState.start_game(user_id: current_user_id))
  end

  def submit_question(data)
    question = data["question"].to_s.strip.first(MAX_QUESTION_LENGTH)
    return if question.blank?

    broadcast_state(AnonymousSurveyState.submit_question(user_id: current_user_id, question: question))
  end

  def vote(data)
    answer = ActiveModel::Type::Boolean.new.cast(data["answer"])
    return if answer.nil?

    broadcast_state(AnonymousSurveyState.vote(user_id: current_user_id, answer: answer))
  end

  def reveal(_data)
    broadcast_state(AnonymousSurveyState.reveal(user_id: current_user_id))
  end

  def next_question(_data)
    broadcast_state(AnonymousSurveyState.next_question(user_id: current_user_id))
  end

  private

  def user_name(data)
    data["name"].to_s.strip.first(MAX_NAME_LENGTH).presence || "NO NAME"
  end

  def broadcast_state(state)
    ActionCable.server.broadcast(STREAM_NAME, state)
  end
end
