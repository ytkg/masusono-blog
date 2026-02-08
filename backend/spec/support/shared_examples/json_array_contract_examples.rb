RSpec.shared_examples "array json contract" do |path:, expected_keys:|
  it "配列JSONの契約を満たす" do
    get path

    expect(response).to have_http_status(:ok)
    payload = JSON.parse(response.body)
    expect(payload).to be_an(Array)
    expect(payload).not_to be_empty
    expect(payload).to all(include(*expected_keys))
  end
end
