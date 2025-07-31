import { ConversationBody, User } from "@workspace/db";
import { Separator } from "@workspace/ui/components/separator";

export function PreviewMessage({
  input,
  date,
  user,
}: {
  input: ConversationBody;
  date: Date;
  user?: User | null;
}) {
  return (
    <div className="border rounded max-w-md text-wrap p-4 text-black bg-[#dcf8c6] grid gap-2">
      <div>{input.header?.text}</div>
      <div>{input.body?.text}</div>
      <div className="text-sm font-light text-muted">{input.footer}</div>
      <div className="flex flex-col items-center gap-4">
        <Separator />
        {input.buttons?.map((el, i) => (
          <div key={i}>
            <button className="text-black/50 bg-[#dcf8c6] text-sm hover:text-black">
              {el.text}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        {user?.email && (
          <div className="text-xs text-right">Sent by:{user?.email}</div>
        )}
        <div className="text-xs font-light text-right">
          {new Date(date).toLocaleDateString()}&nbsp;
          {new Date(date).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
