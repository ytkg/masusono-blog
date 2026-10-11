require "rails_helper"

RSpec.describe XmlEscaper do
  let(:escaper) { Class.new { include XmlEscaper }.new }

  it "escapes every special character once and preserves Unicode" do
    expect(escaper.send(:escape_xml, %q(&<>"'増田😊&amp;))).to eq("&amp;&lt;&gt;&quot;&apos;増田😊&amp;amp;")
    expect(escaper.send(:escape_xml, nil)).to eq("")
  end
end
