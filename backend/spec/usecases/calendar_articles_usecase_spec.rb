require "rails_helper"

RSpec.describe CalendarArticlesUsecase do
  subject(:result) { described_class.call }

  it "does not parse the body of articles without a usable calendar date" do
    articles = [ { id: "invalid", publishedAt: "invalid", content: "ignored" },
      { id: "valid", publishedAt: "2026-01-01T00:00:00Z", content: "kept" } ]
    allow(Article).to receive(:all).and_return(articles)
    allow(Numbers::ArticleCharacterCounter).to receive(:call).and_call_original
    expect(result.dig(:json, :groups).first[:articles].pluck(:id)).to eq([ "valid" ])
    expect(Numbers::ArticleCharacterCounter).not_to have_received(:call).with("ignored")
    expect(articles.first[:content]).to eq("ignored")
  end
end
