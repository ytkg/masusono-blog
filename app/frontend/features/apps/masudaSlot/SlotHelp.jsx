import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import { REELS, SYMBOLS } from "./reels"

export default function SlotHelp({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="slot-help-title" maxWidth="sm" fullWidth>
      <DialogTitle id="slot-help-title">遊び方・配列表</DialogTitle>
      <DialogContent dividers>
        <p>
          レバーで始動し、左・中・右を好きな順で止めます。PCはSpaceで始動、1・2・3で左・中・右を停止。ボタンにフォーカス中はSpaceでそのボタンを操作します。
        </p>
        <p>
          横3本・斜め2本の5ラインが有効。回転は約0.8秒で1周。絵柄は上へ進み、停止時に最大4コマ引き込みます。当選していない役はそろいません。
        </p>
        <p>
          ベル8pt、スイカ3つで6pt、チェリーは左リールの上・中・下のいずれかで2pt。リプレイは次の賭けが無料。同じ役が複数ラインでそろっても払い出しは1回です。
        </p>
        <p>
          チェリー・スイカは配列表で場所を覚え、中央付近を通る直前に停止。取りこぼすことがあります。ベルとリプレイはそろいやすい役です。
        </p>
        <p>
          「野望！」点灯でボーナス当選。BIGは7・7・7、REGは7・7・BARを狙います。左・中の7はそろいやすく、最後の右リールを狙うのがおすすめ。種別は入賞まで秘密。そろうまで当選を持ち越し、小役当選ゲームは小役が優先。入賞待ちも通常3pt掛けで、自動入賞の救済はありません。
        </p>
        <p>
          通常のBIGは1/320、REGは3/1600。ボーナス終了後の野望タイムは50ゲーム、BIGは1/50、REGは1/75。当選で残りゲーム数を終了し、次のボーナス終了後に50ゲームから再開します。
        </p>
        <p>
          ボーナスは1pt掛け。BIGはベル9pt・累計342pt以上（純増約300pt・約38ゲーム）、REGはベル8pt・累計120pt以上（純増約100pt・約15ゲーム）で終了。最後の払い出しも全額加算します。オート消化はボーナス中のみ利用でき、いつでも解除できます。
        </p>
        <p>
          開始は1,000pt。Adsの残高には影響しません。ゲームを閉じる・ページを移動する・再読み込みでリセット。一時的な画面切り替えでは状態を保って停止します。賭け不足でも無料リプレイが残っていれば遊べます。
        </p>
        <table className="slot-strip-table">
          <caption>リール配列（上から順に循環・数字はコマ番号）</caption>
          <thead>
            <tr>
              <th>番号</th>
              <th>左</th>
              <th>中</th>
              <th>右</th>
            </tr>
          </thead>
          <tbody>
            {REELS[0].map((_, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                {REELS.map((strip, reel) => (
                  <td key={reel}>{SYMBOLS[strip[index]]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ゲームに戻る</Button>
      </DialogActions>
    </Dialog>
  )
}
