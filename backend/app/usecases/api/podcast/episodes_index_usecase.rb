module Api
  module Podcast
    class EpisodesIndexUsecase
      def self.call
        new.call
      end

      def call
        episodes = ::Podcast.all.map { |podcast| build_podcast(podcast) }
        { episodes: episodes }
      end

      private

      def build_podcast(podcast)
        audio_url = podcast[:audioUrl]

        {
          id: extract_podcast_id(audio_url),
          title: podcast[:title],
          publishedDate: DateDisplayFormatter.format(podcast[:publishedAt]),
          audioUrl: audio_url
        }
      end

      def extract_podcast_id(audio_url)
        match = audio_url.to_s.match(%r{\Ahttps://storage\.googleapis\.com/masusono-podcast/(?<id>\d+)\.mp3(?:\?.*)?\z})
        match ? match[:id] : ""
      end
    end
  end
end
