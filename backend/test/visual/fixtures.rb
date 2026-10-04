# These fixtures are loaded only by the visual-test server in development.
module VisualTestFixtures
  AUTHORS = [
    {
      id: "visual-author-1",
      name: "増田愛美",
      title: "日常の発見を記録する人",
      bio: "散歩と食事が好きです。気になった出来事を、肩の力を抜いて書いています。"
    },
    {
      id: "visual-author-2",
      name: "チャーリー",
      title: "街を歩く人",
      bio: "寄り道で見つけたものや、友人との会話を記事にしています。"
    }
  ].freeze

  ARTICLES = [
    {
      id: "visual-article-1",
      title: "週末の散歩で見つけたもの",
      publishedAt: "2026-01-15T12:00:00+09:00",
      content: "<p>駅を出て、いつもと違う道を歩きました。角を曲がると、小さな喫茶店を見つけました。</p><p>ゆっくり過ごした週末の記録です。</p>",
      tags: "日常,散歩",
      author: AUTHORS[0]
    },
    {
      id: "visual-article-2",
      title: "友人と食べた昼ごはん",
      publishedAt: "2026-01-12T12:00:00+09:00",
      content: "<p>久しぶりに友人と集まりました。近所のお店で、今日のおすすめを頼みました。</p>",
      tags: "日常,ごはん",
      author: AUTHORS[1]
    }
  ].freeze

  METRICS = {
    blocks: [
      { label: "増田とその他！始動から（2025/10/05〜）", value: "102 日" },
      { label: "総記事数", value: "2 本", children: [ { label: "増田愛美の総記事数", value: "1 本" }, { label: "チャーリーの総記事数", value: "1 本" } ] },
      { label: "総文字数", value: "96 字", children: [ { label: "増田愛美の総文字数", value: "60 字" }, { label: "チャーリーの総文字数", value: "36 字" } ] }
    ],
    trend: {
      title: "推移",
      description: "各指標の累積値を日ごとに表示しています。",
      series: [
        { key: :totalArticles, label: "総記事数", unit: "本", finalValue: "2 本" },
        { key: :totalChars, label: "総文字数", unit: "字", finalValue: "96 字" }
      ],
      points: [
        { date: "2026-01-12", label: "2026/01/12", totalArticles: 1, totalChars: 36 },
        { date: "2026-01-15", label: "2026/01/15", totalArticles: 2, totalChars: 96 }
      ]
    }
  }.freeze

  RANKINGS = [
    { userId: "visual-runner-1", name: "増田愛美", score: 2400, rankedAt: "2026/01/15", rank: 1 },
    { userId: "visual-runner-2", name: "チャーリー", score: 1800, rankedAt: "2026/01/12", rank: 2 }
  ].freeze

  ADMIN_MEDIA = [
    {
      id: "visual-media-1",
      url: "http://localhost:3000/icons/icon-512.png",
      width: 512,
      height: 512,
      alt: "増田とその他！のアイコン",
      createdAt: "2026-01-15T12:00:00+09:00",
      tags: [ "アイコン" ]
    },
    {
      id: "visual-media-2",
      url: "http://localhost:3000/favicon.png",
      width: 64,
      height: 64,
      alt: "サイトのファビコン",
      createdAt: "2026-01-12T12:00:00+09:00",
      tags: [ "サイト" ]
    }
  ].freeze

  module Articles
    def all = VisualTestFixtures::ARTICLES

    def page(limit:, offset:)
      { contents: VisualTestFixtures::ARTICLES.slice(offset, limit) || [], total_count: VisualTestFixtures::ARTICLES.size }
    end

    def find(id) = VisualTestFixtures::ARTICLES.find { |article| article[:id] == id }

    def for_author(author_id) = VisualTestFixtures::ARTICLES.select { |article| article[:author][:id] == author_id }
  end

  module Authors
    def all = VisualTestFixtures::AUTHORS

    def find(id) = VisualTestFixtures::AUTHORS.find { |author| author[:id] == id }
  end

  module Numbers
    def call = { metrics: VisualTestFixtures::METRICS, status: :ok }
  end

  module Rankings
    def call = { json: VisualTestFixtures::RANKINGS, status: :ok }
  end

  module AdminAuth
    def login(username:, password:)
      return unless username == "visual-owner" && password == "visual-password"

      { "access_token" => "visual-access", "refresh_token" => "visual-refresh" }
    end

    def verify(access_token:) = access_token == "visual-access"

    def refresh(refresh_token:)
      return unless refresh_token == "visual-refresh"

      { "access_token" => "visual-access", "refresh_token" => "visual-refresh" }
    end
  end

  module AdminMedia
    def call(query:, page:, cursor: nil)
      {
        props: {
          media: VisualTestFixtures::ADMIN_MEDIA,
          total_count: VisualTestFixtures::ADMIN_MEDIA.length,
          has_more: false,
          next_token: nil,
          page: page.to_i,
          query: query
        },
        status: :ok
      }
    end
  end
end
