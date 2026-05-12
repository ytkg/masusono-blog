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
        },
        {
          id: "third",
          publishedDate: "2025/10/07",
          title: "third title",
          content: "fghi",
          author: "その他4"
        },
        {
          id: "fourth",
          publishedDate: "2025/10/08",
          title: "fourth title",
          content: "jkl",
          author: "その他3"
        }
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
      allow(Podcast).to receive(:all).and_return(podcasts)
      allow(MasudaRunRanking).to receive(:total_count).and_return(25)
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

        expect(total_articles[:value]).to eq("4 本")
        expect(total_articles[:children]).to eq([
          { label: "増田太郎の総記事数", value: "1 本" },
          { label: "その他3の総記事数", value: "1 本" },
          { label: "その他4の総記事数", value: "1 本" },
          { label: "不明の総記事数", value: "1 本" }
        ])
      end

      it do
        total_chars = children.find { |child| child[:label] == "総文字数" }

        expect(total_chars[:value]).to eq("12 字")
        expect(total_chars[:children]).to eq([
          { label: "増田太郎の総文字数", value: "3 字" },
          { label: "その他3の総文字数", value: "3 字" },
          { label: "その他4の総文字数", value: "4 字" },
          { label: "不明の総文字数", value: "2 字" }
        ])
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

    describe "増田RUN" do
      let(:masuda_run_block) { blocks.find { |block| block[:label] == "増田RUN総プレイ回数" } }

      it do
        expect(masuda_run_block).not_to be_nil
      end

      it do
        expect(blocks.last[:label]).to eq("増田RUN総プレイ回数")
      end

      it do
        expect(masuda_run_block[:value]).to eq("25 回")
      end

      context "総プレイ回数の取得に失敗したとき" do
        before do
          allow(MasudaRunRanking).to receive(:total_count).and_raise(Faraday::TimeoutError, "execution expired")
        end

        it do
          expect(result[:status]).to eq(:ok)
          expect(masuda_run_block[:value]).to be_nil
        end
      end
    end
  end
end
