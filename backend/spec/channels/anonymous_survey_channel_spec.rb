require "rails_helper"

RSpec.describe AnonymousSurveyChannel, type: :channel do
  before do
    AnonymousSurveyState.reset!
    stub_connection current_user_id: "cookie-user"
  end

  def appear_second_user
    AnonymousSurveyState.appear(connection_id: "second-connection", user_id: "second-user", name: "その他花子")
  end

  it "購読時に匿名アンケートへ接続する" do
    subscribe

    expect(subscription).to be_confirmed
    expect(subscription).to have_stream_from("anonymous_survey")
  end

  it "参加者一覧を配信する" do
    subscribe

    expect {
      perform :appear, { "name" => "表示名太郎" }
    }.to have_broadcasted_to("anonymous_survey").with(
      hash_including(
        type: "state",
        participants: [
          {
            userId: "cookie-user",
            name: "表示名太郎",
            connectionCount: 1
          }
        ]
      )
    )
  end

  it "ゲーム開始で出題者を配信する" do
    subscribe
    perform :appear, { "name" => "表示名太郎" }
    appear_second_user

    expect {
      perform :start_game, {}
    }.to have_broadcasted_to("anonymous_survey").with(
      hash_including(
        type: "state",
        survey: hash_including(
          question: nil,
          phase: "asking",
          round: 1,
          questioner: {
            userId: "cookie-user",
            name: "表示名太郎"
          }
        )
      )
    )
  end

  it "出題、投票、結果公開を配信する" do
    subscribe
    perform :appear, { "name" => "表示名太郎" }
    appear_second_user
    perform :start_game, {}

    expect {
      perform :submit_question, { "question" => "今日は楽しかった？" }
    }.to have_broadcasted_to("anonymous_survey").with(
      hash_including(
        survey: hash_including(
          question: "今日は楽しかった？",
          phase: "voting",
          votedCount: 0
        )
      )
    )

    expect {
      perform :vote, { "answer" => true }
    }.to have_broadcasted_to("anonymous_survey").with(
      hash_including(
        survey: hash_including(
          phase: "voting",
          votedCount: 1
        )
      )
    )

    AnonymousSurveyState.vote(user_id: "second-user", answer: false)

    expect {
      perform :reveal, {}
    }.to have_broadcasted_to("anonymous_survey").with(
      hash_including(
        survey: hash_including(
          phase: "revealed",
          yesCount: 1,
          noCount: 1
        )
      )
    )
  end

  it "次の質問を配信する" do
    subscribe
    perform :appear, { "name" => "表示名太郎" }
    appear_second_user
    perform :start_game, {}
    perform :submit_question, { "question" => "今日は楽しかった？" }
    perform :vote, { "answer" => true }
    AnonymousSurveyState.vote(user_id: "second-user", answer: false)
    perform :reveal, {}

    expect {
      perform :next_question, {}
    }.to have_broadcasted_to("anonymous_survey").with(
      hash_including(
        survey: hash_including(
          phase: "asking",
          round: 2,
          questioner: {
            userId: "second-user",
            name: "その他花子"
          }
        )
      )
    )
  end
end
