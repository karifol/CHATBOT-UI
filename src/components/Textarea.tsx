function Textarea({ ...props }: React.ComponentProps<"textarea">) {
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto"
    e.target.style.height = `${e.target.scrollHeight}px`
    if (props.onInput) props.onInput(e)
  }

  return (
    <textarea
      data-slot="textarea"
      className="resize-none outline-none w-full min-h-0 overflow-y-auto px-2"
      rows={1}
      onInput={handleInput}
      {...props}
    />
  )
}

export { Textarea }