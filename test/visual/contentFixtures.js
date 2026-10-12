export const richArticleTitle = "散歩の記録から、写真と引用とコードで振り返る長い週末の読みもの"

export const richArticleContent = `
  <section id="visual-prose">
    <h2>散歩で見つけたこと</h2>
    <p>${"いつもの道から少し離れると、見慣れない景色に出会いました。".repeat(5)}</p>
    <h3>寄り道のメモ</h3>
    <ul><li>小さな喫茶店で休憩する</li><li>川沿いを歩き、写真を撮る</li></ul>
    <ol><li>駅から出発</li><li>橋を渡って公園へ</li></ol>
    <blockquote><p>急がず歩けば、いつもの街にも新しい発見がある。</p></blockquote>
    <p><strong>次の週末</strong>も、<em>寄り道</em>を楽しみます。<a href="/about">このサイトについて</a>もご覧ください。</p>
  </section>
  <section id="visual-image">
    <h2>散歩の写真</h2>
    <figure><img src="/icons/icon-512.png" width="512" height="512" alt="散歩記事の固定画像"><figcaption>撮影用のローカル画像</figcaption></figure>
  </section>
  <h2>記録をコードにする</h2>
  <pre><code class="language-javascript">const memo = "${"LongUnbrokenWalkingMemo".repeat(8)}";
console.log(memo);</code></pre>
  <pre><code class="language-ruby">places = ["喫茶店", "公園"]
places.each { |place| puts place }</code></pre>
  <p id="visual-article-end">ここまで読んでいただき、ありがとうございました。</p>
`
