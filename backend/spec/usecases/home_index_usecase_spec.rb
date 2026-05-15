require "rails_helper"

RSpec.describe HomeIndexUsecase do
  describe ".call" do
    it "ブログ一覧のpropsを返す" do
      allow(BlogIndexUsecase).to receive(:call).and_return(
        {
          props: {
            articles: [
              {
                id: "article-1",
                title: "記事1"
              }
            ]
          },
          status: :ok
        }
      )

      result = described_class.call

      expect(result).to eq(
        {
          props: {
            articles: [
              {
                id: "article-1",
                title: "記事1"
              }
            ]
          },
          status: :ok
        }
      )
    end
  end
end
