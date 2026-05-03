require "rails_helper"

RSpec.describe Microcms::Users::FetchByUserIdsService do
  describe ".execute" do
    subject(:result) { service_class.execute(user_ids: user_ids) }

    let(:service_class) do
      klass = Class.new(described_class)
      klass.const_set(:ENDPOINT, "https://example.test/api/v1/users".freeze)
      stub_const("Microcms::TestUsersFetchByUserIdsService", klass)
    end
    let(:endpoint) { service_class::ENDPOINT }

    before do
      stub_microcms_api_key
    end

    context "取得対象がある場合" do
      let(:user_ids) { [ "carol", "bob", "carol", "", nil ] }
      let(:query) { { "limit" => "100", "filters" => "user_id[equals]carol[or]user_id[equals]bob" } }

      before do
        stub_request(:get, endpoint)
          .with(query: query, headers: microcms_request_headers)
          .to_return(
            status: 200,
            body: {
              contents: [
                {
                  id: "u_1",
                  user_id: "carol",
                  name: "Carol"
                },
                {
                  id: "u_2",
                  user_id: "bob",
                  name: ""
                }
              ],
              totalCount: 2,
              limit: 2,
              offset: 0
            }.to_json,
            headers: json_response_headers
          )
      end

      it "user_idで引けるHashを返す" do
        expect(result).to eq(
          {
            "carol" => {
              id: "u_1",
              user_id: "carol",
              name: "Carol"
            },
            "bob" => {
              id: "u_2",
              user_id: "bob",
              name: ""
            }
          }
        )
      end
    end

    context "同じuser_idのレコードが複数返る場合" do
      let(:user_ids) { [ "carol", "bob" ] }
      let(:query) { { "limit" => "100", "filters" => "user_id[equals]carol[or]user_id[equals]bob" } }

      before do
        stub_request(:get, endpoint)
          .with(query: query, headers: microcms_request_headers)
          .to_return(
            status: 200,
            body: {
              contents: [
                {
                  id: "u_1",
                  user_id: "carol",
                  name: ""
                },
                {
                  id: "u_2",
                  user_id: "carol",
                  name: "Carol"
                },
                {
                  id: "u_3",
                  user_id: "bob",
                  name: "Bob"
                }
              ],
              totalCount: 3,
              limit: 100,
              offset: 0
            }.to_json,
            headers: json_response_headers
          )
      end

      it "同じuser_idでは空の表示名より入力済み表示名を優先する" do
        expect(result).to eq(
          {
            "carol" => {
              id: "u_2",
              user_id: "carol",
              name: "Carol"
            },
            "bob" => {
              id: "u_3",
              user_id: "bob",
              name: "Bob"
            }
          }
        )
      end
    end

    context "取得対象がない場合" do
      let(:user_ids) { [ "", nil, " " ] }

      it "microCMSへ問い合わせず空Hashを返す" do
        expect(result).to eq({})
        expect(WebMock).not_to have_requested(:get, endpoint)
      end
    end

    context "取得失敗時" do
      let(:user_ids) { [ "carol", "bob" ] }
      let(:query) { { "limit" => "100", "filters" => "user_id[equals]carol[or]user_id[equals]bob" } }

      before do
        stub_request(:get, endpoint)
          .with(query: query, headers: microcms_request_headers)
          .to_return(status: 503, body: "upstream unavailable", headers: json_response_headers)
      end

      it do
        expect { result }.to raise_error(
          Microcms::FetchContentsService::FetchError,
          "microCMS request failed: status=503, body=upstream unavailable"
        )
      end
    end

    context "一括取得で一部ユーザーが返らない場合" do
      let(:user_ids) { [ "carol", "bob" ] }
      let(:query) { { "limit" => "100", "filters" => "user_id[equals]carol[or]user_id[equals]bob" } }
      let(:single_query) { { "limit" => "1", "filters" => "user_id[equals]bob" } }

      before do
        stub_request(:get, endpoint)
          .with(query: query, headers: microcms_request_headers)
          .to_return(
            status: 200,
            body: {
              contents: [
                {
                  id: "u_1",
                  user_id: "carol",
                  name: "Carol"
                }
              ],
              totalCount: 1,
              limit: 100,
              offset: 0
            }.to_json,
            headers: json_response_headers
          )

        stub_request(:get, endpoint)
          .with(query: single_query, headers: microcms_request_headers)
          .to_return(
            status: 200,
            body: {
              contents: [
                {
                  id: "u_2",
                  user_id: "bob",
                  name: "Bob"
                }
              ],
              totalCount: 1,
              limit: 1,
              offset: 0
            }.to_json,
            headers: json_response_headers
          )
      end

      it "欠落したユーザーだけ単体取得で補完する" do
        expect(result).to eq(
          {
            "carol" => {
              id: "u_1",
              user_id: "carol",
              name: "Carol"
            },
            "bob" => {
              id: "u_2",
              user_id: "bob",
              name: "Bob"
            }
          }
        )
      end
    end
  end
end
