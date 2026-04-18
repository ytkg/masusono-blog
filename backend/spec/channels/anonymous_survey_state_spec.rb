require "rails_helper"

RSpec.describe AnonymousSurveyState do
  DEFAULT_QUESTION = "今日は楽しかった？".freeze
  USERS = {
    user_1: { connection_id: "connection-1", user_id: "user-1", name: "表示名太郎" },
    user_2: { connection_id: "connection-2", user_id: "user-2", name: "その他花子" },
    user_3: { connection_id: "connection-3", user_id: "user-3", name: "増田次郎" }
  }.freeze

  before do
    described_class.reset!
  end

  def appear(user_key)
    user = USERS.fetch(user_key)
    described_class.appear(connection_id: user[:connection_id], user_id: user[:user_id], name: user[:name])
  end

  def appear_users(*user_keys)
    user_keys.each { |user_key| appear(user_key) }
  end

  def ask_default_question
    described_class.submit_question(user_id: "user-1", question: DEFAULT_QUESTION)
  end

  def vote(user_key, answer:)
    described_class.vote(user_id: USERS.fetch(user_key)[:user_id], answer: answer)
  end

  def reveal_by(user_key)
    described_class.reveal(user_id: USERS.fetch(user_key)[:user_id])
  end

  def start_default_survey(*user_keys)
    appear_users(*user_keys)
    described_class.start_game(user_id: "user-1")
    ask_default_question
  end

  def reveal_default_survey
    vote(:user_1, answer: true)
    vote(:user_2, answer: false)
    reveal_by(:user_1)
  end

  it "同一ユーザーの複数接続をまとめる" do
    appear(:user_1)
    state = described_class.appear(connection_id: "connection-2", user_id: "user-1", name: "表示名太郎")

    expect(state[:participants]).to eq(
      [
        {
          userId: "user-1",
          name: "表示名太郎",
          connectionCount: 2
        }
      ]
    )
  end

  it "スタートで最初の参加者を出題者にする" do
    appear_users(:user_1, :user_2)
    state = described_class.start_game(user_id: "user-1")

    expect(state[:survey]).to include(
      question: nil,
      phase: "asking",
      round: 1,
      questioner: {
        userId: "user-1",
        name: "表示名太郎"
      }
    )
  end

  it "参加者が2人未満ならスタートできない" do
    appear(:user_1)

    state = described_class.start_game(user_id: "user-1")

    expect(state[:survey]).to be_nil
  end

  it "最初の参加者以外はスタートできない" do
    appear_users(:user_1, :user_2)

    state = described_class.start_game(user_id: "user-2")

    expect(state[:survey]).to be_nil
  end

  it "参加者の順番で出題者を進める" do
    start_default_survey(:user_1, :user_2)
    reveal_default_survey

    state = described_class.next_question(user_id: "user-1")

    expect(state[:survey]).to include(
      question: nil,
      phase: "asking",
      round: 2,
      questioner: {
        userId: "user-2",
        name: "その他花子"
      }
    )
  end

  it "出題者が退出したら次の参加者を出題者にする" do
    appear_users(:user_1, :user_2)
    described_class.start_game(user_id: "user-1")

    state = described_class.leave(connection_id: "connection-1")

    expect(state[:survey]).to include(
      question: nil,
      phase: "asking",
      round: 1,
      questioner: {
        userId: "user-2",
        name: "その他花子"
      }
    )
  end

  it "出題者以外は次の出題者へ進めない" do
    start_default_survey(:user_1, :user_2)
    reveal_default_survey

    state = described_class.next_question(user_id: "user-2")

    expect(state[:survey]).to include(
      phase: "revealed",
      round: 1,
      questioner: {
        userId: "user-1",
        name: "表示名太郎"
      }
    )
  end

  it "匿名投票は結果公開まで賛否数を出さない" do
    start_default_survey(:user_1, :user_2)
    state = vote(:user_1, answer: true)

    expect(state[:survey]).to include(
      phase: "voting",
      votedCount: 1,
      participantCount: 2
    )
    expect(state[:survey]).not_to include(:yesCount, :noCount)
  end

  it "結果公開時にYES/NO数を出す" do
    start_default_survey(:user_1, :user_2)
    vote(:user_1, answer: true)
    vote(:user_2, answer: false)

    state = reveal_by(:user_1)

    expect(state[:survey]).to include(
      phase: "revealed",
      votedCount: 2,
      participantCount: 2,
      yesCount: 1,
      noCount: 1
    )
  end

  it "全員が回答するまでは結果公開できない" do
    start_default_survey(:user_1, :user_2)
    vote(:user_1, answer: true)

    state = reveal_by(:user_1)

    expect(state[:survey]).to include(
      phase: "voting",
      votedCount: 1,
      participantCount: 2
    )
    expect(state[:survey]).not_to include(:yesCount, :noCount)
  end

  it "結果公開後は回答者が退出しても集計を変えない" do
    start_default_survey(:user_1, :user_2, :user_3)
    vote(:user_1, answer: true)
    vote(:user_2, answer: false)
    vote(:user_3, answer: true)
    reveal_by(:user_1)

    state = described_class.leave(connection_id: "connection-2")

    expect(state[:survey]).to include(
      phase: "revealed",
      votedCount: 3,
      participantCount: 3,
      yesCount: 2,
      noCount: 1
    )
  end

  it "回答中に出題者が退出しても質問を継続する" do
    start_default_survey(:user_1, :user_2, :user_3)
    vote(:user_2, answer: false)

    state = described_class.leave(connection_id: "connection-1")

    expect(state[:survey]).to include(
      question: DEFAULT_QUESTION,
      phase: "voting",
      round: 1,
      questioner: {
        userId: "user-1",
        name: "表示名太郎"
      },
      votedCount: 1,
      participantCount: 2
    )
    expect(state[:survey]).not_to include(:yesCount, :noCount)
  end

  it "回答中に出題者が退出した質問は全員回答で自動公開する" do
    start_default_survey(:user_1, :user_2, :user_3)
    described_class.leave(connection_id: "connection-1")
    vote(:user_2, answer: false)

    state = vote(:user_3, answer: true)

    expect(state[:survey]).to include(
      phase: "revealed",
      votedCount: 2,
      participantCount: 2,
      yesCount: 1,
      noCount: 1,
      nextQuestioner: {
        userId: "user-2",
        name: "その他花子"
      }
    )
  end

  it "出題者がいない結果表示では次の出題者だけが進める" do
    start_default_survey(:user_1, :user_2, :user_3)
    described_class.leave(connection_id: "connection-1")
    vote(:user_2, answer: false)
    vote(:user_3, answer: true)

    state = described_class.next_question(user_id: "user-2")

    expect(state[:survey]).to include(
      question: nil,
      phase: "asking",
      round: 2,
      questioner: {
        userId: "user-2",
        name: "その他花子"
      }
    )
  end

  it "出題者がいない結果表示では次の出題者以外は進めない" do
    start_default_survey(:user_1, :user_2, :user_3)
    described_class.leave(connection_id: "connection-1")
    vote(:user_2, answer: false)
    vote(:user_3, answer: true)

    state = described_class.next_question(user_id: "user-3")

    expect(state[:survey]).to include(
      phase: "revealed",
      round: 1,
      nextQuestioner: {
        userId: "user-2",
        name: "その他花子"
      }
    )
  end

  it "出題者がいない結果表示では次の出題者以外が退出しても次の出題者を維持する" do
    start_default_survey(:user_1, :user_2, :user_3)
    described_class.leave(connection_id: "connection-1")
    vote(:user_2, answer: false)
    vote(:user_3, answer: true)

    state = described_class.leave(connection_id: "connection-3")

    expect(state[:survey]).to include(
      phase: "revealed",
      round: 1,
      nextQuestioner: {
        userId: "user-2",
        name: "その他花子"
      }
    )
  end

  it "出題者がいない結果表示では次の出題者が退出した時だけ再選出する" do
    start_default_survey(:user_1, :user_2, :user_3)
    described_class.leave(connection_id: "connection-1")
    vote(:user_2, answer: false)
    vote(:user_3, answer: true)

    state = described_class.leave(connection_id: "connection-2")

    expect(state[:survey]).to include(
      phase: "revealed",
      round: 1,
      nextQuestioner: {
        userId: "user-3",
        name: "増田次郎"
      }
    )
  end

  it "結果公開後は出題者が退出しても結果表示を維持する" do
    start_default_survey(:user_1, :user_2)
    reveal_default_survey

    state = described_class.leave(connection_id: "connection-1")

    expect(state[:survey]).to include(
      phase: "revealed",
      round: 1,
      votedCount: 2,
      participantCount: 2,
      yesCount: 1,
      noCount: 1,
      nextQuestioner: {
        userId: "user-2",
        name: "その他花子"
      }
    )
  end

  it "出題者以外は結果公開できない" do
    start_default_survey(:user_1, :user_2)
    vote(:user_1, answer: true)
    vote(:user_2, answer: false)

    state = reveal_by(:user_2)

    expect(state[:survey]).to include(phase: "voting")
    expect(state[:survey]).not_to include(:yesCount, :noCount)
  end

  it "退出した最後の接続の投票を外す" do
    start_default_survey(:user_1)
    vote(:user_1, answer: true)

    state = described_class.leave(connection_id: "connection-1")

    expect(state[:participants]).to eq([])
    expect(state[:survey]).to be_nil
  end
end
