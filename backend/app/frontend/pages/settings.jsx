import PageContainer from "../shared/PageContainer"
import SectionHeading from "../shared/SectionHeading"
import SeoHead from "../shared/SeoHead"
import { SettingsContent } from "../features/apps/settings/SettingsApp"

export default function Settings() {
  return (
    <>
      <SeoHead
        title="設定"
        description="増田とその他！の表示名など、サイトの設定を変更できます。"
        canonicalPath="/settings"
      />

      <PageContainer id="settings" sx={{ pb: 10 }}>
        <SectionHeading component="h1">設定</SectionHeading>
        <SettingsContent loadOnMount />
      </PageContainer>
    </>
  )
}
