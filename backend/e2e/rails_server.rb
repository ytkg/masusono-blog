#!/usr/bin/env ruby

require "rackup"

config_path = File.expand_path("../config.ru", __dir__)
app, = Rack::Builder.parse_file(config_path)

require_relative "boot"

E2e::Boot.install!

Rackup::Server.start(
  app: app,
  server: "puma",
  Host: ENV.fetch("HOST", "127.0.0.1"),
  Port: Integer(ENV.fetch("PORT", "3000"))
)
