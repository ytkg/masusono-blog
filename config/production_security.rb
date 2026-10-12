module ProductionSecurity
  ALLOWED_HOSTS = [
    "masusono.com",
    "www.masusono.com",
    # The production service and per-PR staging services use this deterministic
    # Cloud Run hostname format for project 332902117625 in asia-northeast1.
    /masusono(?:-[a-z0-9-]+)?-332902117625\.asia-northeast1\.run\.app/
  ].freeze
end
