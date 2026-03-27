export default function AccessLevel() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)] size-full" data-name="Access Level">
      <div className="bg-white relative shrink-0 w-full">
        <div className="content-stretch flex flex-col items-start pl-[20px] pr-[10px] py-[10px] relative w-full">
          <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
            <p className="leading-[normal]">No Access</p>
          </div>
        </div>
      </div>
      <div className="bg-white relative shrink-0 w-full">
        <div className="content-stretch flex flex-col items-start pl-[20px] pr-[10px] py-[10px] relative w-full">
          <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
            <p className="leading-[normal]">View Only</p>
          </div>
        </div>
      </div>
      <div className="bg-white relative shrink-0 w-full">
        <div className="content-stretch flex flex-col items-start pl-[20px] pr-[10px] py-[10px] relative w-full">
          <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
            <p className="leading-[normal]">Manage</p>
          </div>
        </div>
      </div>
    </div>
  );
}