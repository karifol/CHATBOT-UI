import { GiSpellBook } from "react-icons/gi";
import { APP_TITLE } from "@/lib/constants";

const TitleLogo = ({title = APP_TITLE}: {title?: string}) => {
  return (
    <div className="flex flex-col items-center">
      {/* アイコン */}
      <div className="w-20 h-20 rounded-full bg-white border flex items-center justify-center mb-2">
        <GiSpellBook className="text-5xl" />
      </div>
      {/* タイトル */}
      <div className="text-2xl">
        { title }
      </div>
    </div>
  )
}

export default TitleLogo