class Podcast
  ALL = [
    {
      "id" => "001",
      "title" => "プライベートとか普通とかの話",
      "publishedAt" => "2026/02/07",
      "audioUrl" => "https://storage.googleapis.com/masusono-podcast/001.mp3"
    }
  ].freeze

  def self.all
    ALL
  end
end
