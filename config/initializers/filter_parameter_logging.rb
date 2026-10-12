# Be sure to restart your server when you modify this file.

# Configure parameters to be partially matched (e.g. passw matches password) and filtered from the log file.
# Use this to limit dissemination of sensitive information.
# See the ActiveSupport::ParameterFilter documentation for supported notations and behaviors.
Rails.application.config.filter_parameters += [
  :passw, :email, :secret, :token, :_key, :crypt, :salt, :certificate, :otp, :ssn, :cvv, :cvc
]

# Raw client diagnostics are untrusted; only the sanitized structured event is logged.
Rails.application.config.filter_parameters += [ :failure ]

# Push endpoints identify a browser subscription and may contain delivery tokens.
Rails.application.config.filter_parameters += [ :endpoint ]
