require "rails_helper"
require "tempfile"

RSpec.describe Microcms::UploadMediaService do
  Request = Struct.new(:headers, :body) do
    def initialize
      super({}, nil)
    end
  end

  class Connection
    attr_reader :path, :request

    def initialize(response)
      @response = response
    end

    def post(path)
      @path = path
      @request = Request.new
      yield @request
      @response
    end
  end

  def uploaded_image
    tempfile = Tempfile.new([ "photo", ".png" ])
    tempfile.write("\x89PNG\r\n\x1A\n")
    tempfile.rewind
    ActionDispatch::Http::UploadedFile.new(tempfile:, filename: "photo.png", type: "image/png")
  end

  it "画像をmultipart/form-dataでメディアAPIへ送信する" do
    connection = Connection.new(double(success?: true, body: { id: "new-image", url: "https://example.com/photo.png" }.to_json))

    result = described_class.call(file: uploaded_image, api_key: "test-key", connection:)

    expect(result).to include("id" => "new-image")
    expect(connection.path).to eq("api/v1/media")
    expect(connection.request.headers).to include("X-MICROCMS-API-KEY" => "test-key")
    expect(connection.request.headers.fetch("Content-Type")).to start_with("multipart/form-data; boundary=")
    expect(connection.request.body).to include('name="file"; filename="photo.png"', "Content-Type: image/png")
  end

  it "画像以外を送信しない" do
    tempfile = Tempfile.new([ "document", ".txt" ])
    tempfile.write("text")
    tempfile.rewind
    file = ActionDispatch::Http::UploadedFile.new(tempfile:, filename: "document.txt", type: "text/plain")

    expect { described_class.call(file:, api_key: "test-key", connection: Connection.new(nil)) }
      .to raise_error(Microcms::UploadMediaService::ValidationError, "画像ファイルを選択してください。")
  end

  it "5MBを超える画像を送信しない" do
    file = instance_double(ActionDispatch::Http::UploadedFile, tempfile: Tempfile.new, size: 5.megabytes + 1)

    expect { described_class.call(file:, api_key: "test-key", connection: Connection.new(nil)) }
      .to raise_error(Microcms::UploadMediaService::ValidationError, "画像ファイルは5MB以下にしてください。")
  end

  it "microCMSのエラーをUploadErrorとして扱う" do
    connection = Connection.new(double(success?: false, body: ""))

    expect { described_class.call(file: uploaded_image, api_key: "test-key", connection:) }
      .to raise_error(Microcms::UploadMediaService::UploadError)
  end
end
