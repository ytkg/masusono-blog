require "rails_helper"

RSpec.describe Api::App::Numbers::MetricsIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    let(:articles) do
      [
        {
          id: "first",
          publishedDate: "2025/10/05",
          title: "first title",
          content: "<p>abc</p>",
          author: "増田太郎"
        },
        {
          id: "second",
          publishedDate: "2025/10/06",
          title: "second title",
          content: "de",
          author: nil
        }
      ]
    end

    let(:shops) do
      [
        { category: "居酒屋" },
        { category: "居酒屋" },
        { category: "ラーメン" }
      ]
    end

    let(:podcasts) do
      [
        { "id" => "001" }
      ]
    end

    before do
      allow(Date).to receive(:current).and_return(Date.new(2025, 10, 10))
      allow(Article).to receive(:all).and_return(articles)
      allow(Shop).to receive(:all).and_return(shops)
      allow(Podcast).to receive(:all).and_return(podcasts)
    end

    let(:blocks) { result[:json][:blocks] }

    describe "起算日" do
      it do
        expect(result[:status]).to eq(:ok)
        expect(blocks.first).to eq(
          {
            label: "増田とその他！始動から（2025/10/05〜）",
            value: "5 日"
          }
        )
      end
    end

    describe "ブログ" do
      let(:blog_block) { blocks.find { |block| block[:label] == "ブログ" } }
      let(:children) { blog_block[:children] }

      it do
        expect(blog_block).not_to be_nil
      end

      it do
        total_articles = children.find { |child| child[:label] == "総記事数" }

        expect(total_articles[:value]).to eq("2 本")
        expect(total_articles[:children]).to include(
          { label: "増田太郎の総記事数", value: "1 本" },
          { label: "不明の総記事数", value: "1 本" }
        )
      end

      it do
        total_chars = children.find { |child| child[:label] == "総文字数" }

        expect(total_chars[:value]).to eq("5 字")
        expect(total_chars[:children]).to include(
          { label: "増田太郎の総文字数", value: "3 字" },
          { label: "不明の総文字数", value: "2 字" }
        )
      end
    end

    describe "推し店" do
      let(:shops_block) { blocks.find { |block| block[:label] == "推し店" } }

      it do
        expect(shops_block).not_to be_nil
      end

      it do
        total_shops = shops_block[:children].first

        expect(total_shops[:value]).to eq("3 件")
        expect(total_shops[:children]).to include(
          { label: "居酒屋の件数", value: "2 件" },
          { label: "ラーメンの件数", value: "1 件" }
        )
      end
    end

    describe "ポッドキャスト" do
      let(:podcast_block) { blocks.find { |block| block[:label] == "ポッドキャスト総本数" } }

      it do
        expect(podcast_block).not_to be_nil
      end

      it do
        expect(podcast_block[:value]).to eq("1 本")
      end
    end
  end
end
