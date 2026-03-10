module E2e
  module Boot
    module_function

    def install!
      stub_execute(Microcms::FetchArticlesService, articles_fixture)
      stub_execute(Microcms::FetchPodcastsService, podcasts_fixture)
    end

    def articles_fixture
      [
        {
          id: "e2e-article-1",
          title: "E2E で確認する記事",
          publishedAt: "2026-03-01T09:00:00+09:00",
          content: "<p>Playwright から確認するための本文です。</p>",
          author: {
            name: "E2E 著者"
          }
        }
      ]
    end

    def podcasts_fixture
      [
        {
          title: "E2E ポッドキャスト回",
          publishedAt: "2026-03-02T10:00:00+09:00",
          audioUrl: "https://storage.googleapis.com/masusono-podcast/001.mp3"
        }
      ]
    end

    def stub_execute(service_class, response)
      service_class.define_singleton_method(:execute) do |*_, **__|
        E2e::Boot.deep_dup(response)
      end
    end

    def deep_dup(value)
      case value
      when Array
        value.map { |item| deep_dup(item) }
      when Hash
        value.each_with_object({}) do |(key, child), result|
          result[key] = deep_dup(child)
        end
      else
        value
      end
    end
  end
end
