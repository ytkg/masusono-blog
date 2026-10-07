require "faraday"
require "json"
require "securerandom"

module Microcms
  class UploadMediaService
    BASE_URL = "https://masusono.microcms-management.io/".freeze
    MAX_FILE_SIZE = 5.megabytes

    class UploadError < StandardError; end

    class ValidationError < StandardError
      attr_reader :code

      def initialize(code, message)
        super(message)
        @code = code
      end
    end

    def self.call(file:, connection: nil, api_key: nil)
      new(connection:, api_key:).call(file:)
    end

    def initialize(connection: nil, api_key: nil)
      @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
      raise UploadError, "microCMS API key is missing" if @api_key.blank?

      @connection = connection || Microcms::ConnectionFactory.build(url: BASE_URL)
    end

    def call(file:)
      validate!(file)
      @boundary = "----Masusono#{SecureRandom.hex(16)}"
      response = @connection.post("api/v1/media") do |request|
        request.headers["X-MICROCMS-API-KEY"] = @api_key
        request.headers["Content-Type"] = "multipart/form-data; boundary=#{boundary}"
        request.body = multipart_body(file)
      end
      raise UploadError, "microCMS media upload failed" unless response.success?

      JSON.parse(response.body)
    rescue JSON::ParserError, Faraday::Error => error
      raise UploadError, "microCMS media upload failed", cause: error
    end

    private

    attr_reader :boundary

    def validate!(file)
      raise ValidationError.new("file_required", "画像ファイルを選択してください。") unless file.respond_to?(:tempfile)
      raise ValidationError.new("file_too_large", "画像ファイルは5MB以下にしてください。") if file.size > MAX_FILE_SIZE

      detected_type = Marcel::MimeType.for(file.tempfile, name: file.original_filename)
      return if file.content_type.to_s.start_with?("image/") && detected_type.to_s.start_with?("image/")

      raise ValidationError.new("invalid_file_type", "画像ファイルを選択してください。")
    end

    def multipart_body(file)
      filename = file.original_filename.to_s.gsub(/[\r\n\\\"]/, "_")
      file.tempfile.rewind
      content = file.tempfile.read
      body = +"".b
      body << "--#{boundary}\r\n".b
      body << "Content-Disposition: form-data; name=\"file\"; filename=\"#{filename}\"\r\n".b
      body << "Content-Type: #{file.content_type}\r\n\r\n".b
      body << content
      body << "\r\n--#{boundary}--\r\n".b
      body
    end
  end
end
