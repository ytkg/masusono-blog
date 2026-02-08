class Shop
  ALL = [
    {
      name: "遊飯家 酒舞",
      lat: 35.73202379362531,
      lng: 139.56593645767256,
      category: "居酒屋",
      url: "https://maps.app.goo.gl/9C6Qtp6QuQgFPCL76",
      desc: "うまい"
    },
    {
      name: "たなか青空笑店",
      lat: 35.72869775877621,
      lng: 139.55626931570987,
      category: "ラーメン",
      url: "https://maps.app.goo.gl/eea5T7TdLXzWfbKR6",
      desc: "店主の田中さんが作る煮干しラーメン、タナニボ。"
    },
    {
      name: "四文屋 新井薬師本店",
      lat: 35.71561877202708,
      lng: 139.6712455122299,
      category: "居酒屋",
      url: "https://maps.app.goo.gl/mwpZwHzWDA4T6EoX8",
      desc: "うまい"
    },
    {
      name: "地鶏割烹 おはじき新宿店",
      lat: 35.69399449366612,
      lng: 139.69791526359788,
      category: "居酒屋",
      url: "https://maps.app.goo.gl/8nGeBjzDgkm34fyk6",
      desc: "うまい"
    }
  ].freeze

  def self.all
    ALL
  end
end
