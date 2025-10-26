const UserMessage = ({ message }: { message: string }) => {
  return (
      <div className="flex items-center gap-2 justify-end py-5">
        <div className= "bg-gray-100 rounded-lg px-4 py-2  max-w-[70%] markdown-body">
          <div>{message}</div>
        </div>
      </div>
  )
}

export default UserMessage