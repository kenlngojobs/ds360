import svgPaths from "./svg-yhmh3j8zi4";
import imgKennethNgo from "figma:asset/e9ae7dd1b0fec57a241956478eec0e78bb6d67c7.png";

function Ds360Logo() {
  return (
    <div className="h-[61.399px] relative shrink-0 w-[100.083px]" data-name="DS360 Logo">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100.083 61.3986">
        <g id="DS360 Logo">
          <path d={svgPaths.p32a58670} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p1e17cd00} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p32fd6300} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p38a8b900} fill="var(--fill-0, #5EA7A3)" id="Vector_4" />
          <path d={svgPaths.p3a60c600} fill="var(--fill-0, white)" id="Vector_5" />
          <path d={svgPaths.p108b6fc0} fill="var(--fill-0, white)" id="Vector_6" />
          <path d={svgPaths.pdbc4380} fill="var(--fill-0, white)" id="Vector_7" />
          <path d={svgPaths.p2003d440} fill="var(--fill-0, white)" id="Vector_8" />
          <path d={svgPaths.p16edf800} fill="var(--fill-0, white)" id="Vector_9" />
          <path d={svgPaths.p755140} fill="var(--fill-0, #5EA7A3)" id="Vector_10" />
          <path d={svgPaths.p9f3d00} fill="var(--fill-0, white)" id="Vector_11" />
          <path d={svgPaths.p296e6600} fill="var(--fill-0, white)" id="Vector_12" />
          <path d={svgPaths.p2185d800} fill="var(--fill-0, white)" id="Vector_13" />
          <path d={svgPaths.p293b1240} fill="var(--fill-0, white)" id="Vector_14" />
          <path d={svgPaths.p1f745880} fill="var(--fill-0, #5EA7A3)" id="Vector_15" />
          <path d={svgPaths.p311b9780} fill="var(--fill-0, #5EA7A3)" id="Vector_16" />
        </g>
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="relative shrink-0 w-full" data-name="Logo">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[60px] relative w-full">
          <Ds360Logo />
        </div>
      </div>
    </div>
  );
}

function KennethNgo() {
  return (
    <div className="relative rounded-[64px] shrink-0 size-[24px]" data-name="Kenneth Ngo">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[64px] size-full" src={imgKennethNgo} />
    </div>
  );
}

function AvatarName() {
  return (
    <div className="content-stretch flex gap-[8px] h-[37px] items-center justify-center py-[4px] relative rounded-[8px] shrink-0 w-full" data-name="Avatar-Name">
      <KennethNgo />
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">Kenneth Ngo</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] h-[111px] items-center justify-center relative shrink-0 w-[170px]">
      <Logo />
      <AvatarName />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex items-center justify-center px-[78px] relative shrink-0 w-[180px]">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <button className="block cursor-pointer relative size-[25px]" data-name="Right">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
              <path d={svgPaths.p12cbd500} fill="var(--fill-0, white)" id="Right" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[17.19px] ml-0 mt-[7.02%] relative row-1 w-[17.5px]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5 17.1904">
          <path d={svgPaths.p1daf6d00} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[22.5px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[134.5px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Home</p>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Home">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group3 />
        </div>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[17.52px] ml-0 mt-[6.2%] relative row-1 w-[17.309px]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.3091 17.5195">
          <path d={svgPaths.p2f426080} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[22.31px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[134.69px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Users</p>
      </div>
    </div>
  );
}

function Users() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Users">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group />
        </div>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[17.49px] ml-0 mt-[6.27%] relative row-1 w-[17.506px]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5062 17.4902">
          <path d={svgPaths.p3faf8900} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[22.51px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[134.494px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Partners</p>
      </div>
    </div>
  );
}

function Partners() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Partners">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group1 />
        </div>
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[17.5px] ml-0 mt-[6.25%] relative row-1 w-[15.502px]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.502 17.5">
          <path d={svgPaths.p2a4b3a00} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[20.5px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[136.498px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Document Templates</p>
      </div>
    </div>
  );
}

function DocumentTemplates() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Document Templates">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group2 />
        </div>
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[17.55px] ml-0 mt-[6.13%] relative row-1 w-[17.496px]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.4957 17.5498">
          <path d={svgPaths.p3d6a2d00} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[22.5px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[134.505px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Account Treatment</p>
      </div>
    </div>
  );
}

function AccountTreatment() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Account Treatment">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group4 />
        </div>
      </div>
    </div>
  );
}

function Group5() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[19.286px] ml-0 mt-[1.78%] relative row-1 w-[18.001px]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0007 19.286">
          <path d={svgPaths.p2d257300} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[23px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[133.999px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Tags</p>
      </div>
    </div>
  );
}

function Tags() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Tags">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group5 />
        </div>
      </div>
    </div>
  );
}

function CatIcon() {
  return (
    <div className="col-1 ml-0 mt-px relative row-1 size-[18px]" data-name="cat icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_1_6823)" id="cat icon">
          <path d={svgPaths.p9035b00} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p9270c80} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p2cd77300} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p34a600} fill="var(--fill-0, white)" id="Vector_4" />
        </g>
        <defs>
          <clipPath id="clip0_1_6823">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Group11() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <CatIcon />
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[24.98px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[134.021px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Category</p>
      </div>
    </div>
  );
}

function Categoy() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Categoy">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group11 />
        </div>
      </div>
    </div>
  );
}

function Group6() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[16px] ml-0 mt-[10%] relative row-1 w-[15.999px]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9988 15.9998">
          <path d={svgPaths.pe90c700} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[21px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[136px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Groups</p>
      </div>
    </div>
  );
}

function Groups() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Groups">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group6 />
        </div>
      </div>
    </div>
  );
}

function Group14() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[17.5px] ml-0 mt-[1.25px] relative row-1 w-[17.491px]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.4908 17.5">
          <path d={svgPaths.pe1bae00} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[22.49px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[134.509px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Messages</p>
      </div>
    </div>
  );
}

function Messages() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Messages">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group14 />
        </div>
      </div>
    </div>
  );
}

function Group13() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[18.02px] ml-0 mt-[4.95%] relative row-1 w-[18.01px]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0098 18.0195">
          <path d={svgPaths.p11fd8f00} fill="var(--fill-0, black)" id="Union" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[23.01px] mt-0 not-italic relative row-1 text-[12px] text-black tracking-[-0.12px] w-[133.99px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Offerings</p>
      </div>
    </div>
  );
}

function Offerings1() {
  return (
    <div className="bg-white h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Offerings">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group13 />
        </div>
      </div>
    </div>
  );
}

function Group12() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[16.04px] ml-0 mt-[1.98px] relative row-1 w-[17.532px]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5316 16.04">
          <path d={svgPaths.p3e52e800} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[22.53px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[134.468px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">My Deals</p>
      </div>
    </div>
  );
}

function MyDeals() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="My Deals">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group12 />
        </div>
      </div>
    </div>
  );
}

function Group15() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[18px] ml-0 mt-[5%] relative row-1 w-[17.979px]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.9795 18">
          <path d={svgPaths.p33582200} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[22.98px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[134.021px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Post Sale</p>
      </div>
    </div>
  );
}

function PostSales() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Post Sales">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group15 />
        </div>
      </div>
    </div>
  );
}

function Group10() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[16.99px] ml-0 mt-[7.53%] relative row-1 w-[17.49px]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.4905 16.9902">
          <path d={svgPaths.p2a14a200} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[22.49px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[134.51px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">SAM Documents</p>
      </div>
    </div>
  );
}

function SamDocuments() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="SAM Documents">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group10 />
        </div>
      </div>
    </div>
  );
}

function Group9() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[19.911px] ml-0 mt-[0.93%] relative row-1 w-[17.5px]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5 19.9111">
          <path d={svgPaths.p2797f980} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[23px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[134px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Notifications</p>
      </div>
    </div>
  );
}

function Feedback() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Feedback">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group9 />
        </div>
      </div>
    </div>
  );
}

function Group8() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[17.51px] ml-0 mt-[6.22%] relative row-1 w-[17.5px]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.4999 17.5098">
          <path d={svgPaths.p14dc2e00} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[22.5px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[134.5px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Reports</p>
      </div>
    </div>
  );
}

function Reports() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Reports">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group8 />
        </div>
      </div>
    </div>
  );
}

function Group7() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 h-[17.987px] ml-0 mt-[5.03%] relative row-1 w-[16.22px]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.2205 17.9865">
          <path d={svgPaths.p39d8a800} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
      <div className="col-1 flex flex-col font-['Poppins:Medium',sans-serif] justify-center ml-[21.22px] mt-0 not-italic relative row-1 text-[12px] text-white tracking-[-0.12px] w-[135.779px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[20px] whitespace-pre-wrap">Settings</p>
      </div>
    </div>
  );
}

function Settings() {
  return (
    <div className="h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Settings">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] relative size-full">
          <Group7 />
        </div>
      </div>
    </div>
  );
}

function Menu() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-between min-h-px min-w-px relative w-full" data-name="Menu">
      <Home />
      <Users />
      <Partners />
      <DocumentTemplates />
      <AccountTreatment />
      <Tags />
      <Categoy />
      <Groups />
      <Messages />
      <Offerings1 />
      <MyDeals />
      <PostSales />
      <SamDocuments />
      <Feedback />
      <Reports />
      <Settings />
    </div>
  );
}

function Dashboard() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] h-full items-center min-h-px min-w-px relative" data-name="Dashboard">
      <Menu />
      <div className="h-0 relative shrink-0 w-[135.5px]" data-name="Divider">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 135.5 1">
            <path d="M0 0.5H135.5" id="Divider" stroke="var(--stroke-0, white)" />
          </svg>
        </div>
      </div>
      <div className="bg-[#352b5d] h-[36px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0 w-full" data-name="Sign Out">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[5px] items-center px-[20px] relative size-full">
            <div className="relative shrink-0 size-[17.2px]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.1999 17.2">
                <path d={svgPaths.p5d15c80} fill="var(--fill-0, white)" id="Vector" />
              </svg>
            </div>
            <div className="flex flex-[1_0_0] flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[12px] text-white tracking-[-0.12px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
              <p className="leading-[20px] whitespace-pre-wrap">Sign Out</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateIco() {
  return (
    <div className="relative shrink-0 size-[25px]" data-name="create Ico">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
        <g clipPath="url(#clip0_1_6890)" id="create Ico">
          <path d={svgPaths.p135bac80} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p3c0efb00} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p26d48140} fill="var(--fill-0, white)" id="Vector_3" />
        </g>
        <defs>
          <clipPath id="clip0_1_6890">
            <rect fill="white" height="25" width="25" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function CreateMainFolderBtn() {
  return (
    <div className="content-stretch flex gap-[20px] h-[49px] items-center justify-end px-[10px] relative shrink-0" data-name="Create Main Folder Btn">
      <div className="bg-[#46367f] content-stretch flex gap-[10px] h-full items-center justify-center px-[30px] py-[12px] relative rounded-[50px] shrink-0" data-name="Create File Btn">
        <CreateIco />
        <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-white">Create New Offering</p>
      </div>
      <button className="bg-[#46367f] content-stretch cursor-pointer flex h-[49px] items-center justify-center px-[80px] py-[12px] relative rounded-[100px] shrink-0 w-[201px]">
        <div aria-hidden="true" className="absolute border border-[#46367f] border-solid inset-0 pointer-events-none rounded-[100px]" />
        <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-left text-white">Offering Groups</p>
      </button>
    </div>
  );
}

function InnerFrame() {
  return (
    <div className="content-stretch flex gap-[10px] h-[53px] items-start relative shrink-0 w-full" data-name="Inner Frame">
      <div className="bg-[rgba(0,0,0,0.05)] flex-[1_0_0] h-[41px] min-h-px min-w-px relative rounded-[45px]" data-name="Search">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[4px] items-center px-[10px] py-[4px] relative size-full">
            <div className="relative shrink-0 size-[16px]" data-name="Search-s">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                <div className="absolute inset-[9.22%_9.38%_9.38%_9.22%]" data-name="Vector">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.0242 13.025">
                    <path d={svgPaths.p20180f00} fill="var(--fill-0, black)" fillOpacity="0.2" id="Vector" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(0,0,0,0.2)] tracking-[-0.12px] whitespace-nowrap" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
              <p className="leading-[20px]">Search</p>
            </div>
            <div className="-translate-y-1/2 absolute h-[18px] right-[8px] top-1/2" data-name="Shortcut">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-full items-center justify-end" />
            </div>
          </div>
        </div>
      </div>
      <CreateMainFolderBtn />
    </div>
  );
}

function UserName() {
  return (
    <div className="content-stretch flex gap-[10px] items-center px-[10px] relative shrink-0 w-[450px]" data-name="User Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[12px] text-white tracking-[-0.12px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[14px] whitespace-pre-wrap">Offerings</p>
      </div>
      <div className="content-stretch flex flex-col h-[20px] items-center justify-center pl-[10px] pr-[15px] py-[10px] relative shrink-0" data-name="Column Filter">
        <div aria-hidden="true" className="absolute border-r border-solid border-white inset-0 pointer-events-none" />
        <div className="h-[5px] relative shrink-0 w-[10px]">
          <div className="absolute inset-[-20%_-10%_-28.28%_-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.41422">
              <path d="M1 1L5.96894 6L11 1" id="Vector 1" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function FirstName() {
  return (
    <div className="content-stretch flex gap-[10px] items-center px-[10px] relative shrink-0 w-[200px]" data-name="First Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[12px] text-center text-white tracking-[-0.12px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[14px] whitespace-pre-wrap">Group</p>
      </div>
      <div className="content-stretch flex flex-col h-[20px] items-center justify-center pl-[10px] pr-[15px] py-[10px] relative shrink-0" data-name="Column Filter">
        <div aria-hidden="true" className="absolute border-r border-solid border-white inset-0 pointer-events-none" />
        <div className="h-[5px] relative shrink-0 w-[10px]">
          <div className="absolute inset-[-20%_-10%_-28.28%_-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.41422">
              <path d="M1 1L5.96894 6L11 1" id="Vector 1" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function LastName() {
  return (
    <div className="content-stretch flex gap-[10px] items-center px-[10px] relative shrink-0 w-[140px]" data-name="Last Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[12px] text-center text-white tracking-[-0.12px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[14px] whitespace-pre-wrap">Scenarios</p>
      </div>
      <div className="content-stretch flex flex-col h-[20px] items-center justify-center pl-[10px] pr-[15px] py-[10px] relative shrink-0" data-name="Column Filter">
        <div aria-hidden="true" className="absolute border-r border-solid border-white inset-0 pointer-events-none" />
        <div className="h-[5px] relative shrink-0 w-[10px]">
          <div className="absolute inset-[-20%_-10%_-28.28%_-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.41422">
              <path d="M1 1L5.96894 6L11 1" id="Vector 1" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Partner() {
  return (
    <div className="content-stretch flex gap-[10px] items-center px-[10px] relative shrink-0 w-[200px]" data-name="Partner">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[12px] text-center text-white tracking-[-0.12px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[14px] whitespace-pre-wrap">Seller</p>
      </div>
      <div className="content-stretch flex flex-col h-[20px] items-center justify-center pl-[10px] pr-[15px] py-[10px] relative shrink-0" data-name="Column Filter">
        <div aria-hidden="true" className="absolute border-r border-solid border-white inset-0 pointer-events-none" />
        <div className="h-[5px] relative shrink-0 w-[10px]">
          <div className="absolute inset-[-20%_-10%_-28.28%_-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.41422">
              <path d="M1 1L5.96894 6L11 1" id="Vector 1" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnerType() {
  return (
    <div className="content-stretch flex gap-[10px] items-center px-[10px] relative shrink-0 w-[420px]" data-name="Partner Type">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[12px] text-center text-white tracking-[-0.12px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[14px] whitespace-pre-wrap">Status</p>
      </div>
      <div className="content-stretch flex flex-col h-[20px] items-center justify-center pl-[10px] pr-[15px] py-[10px] relative shrink-0" data-name="Column Filter">
        <div aria-hidden="true" className="absolute border-r border-solid border-white inset-0 pointer-events-none" />
        <div className="h-[5px] relative shrink-0 w-[10px]">
          <div className="absolute inset-[-20%_-10%_-28.28%_-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.41422">
              <path d="M1 1L5.96894 6L11 1" id="Vector 1" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Status() {
  return (
    <div className="content-stretch flex gap-[10px] items-center px-[10px] relative shrink-0 w-[240px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[12px] text-center text-white tracking-[-0.12px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[14px] whitespace-pre-wrap">Type</p>
      </div>
      <div className="content-stretch flex flex-col h-[20px] items-center justify-center pl-[10px] pr-[15px] py-[10px] relative shrink-0" data-name="Column Filter">
        <div aria-hidden="true" className="absolute border-r border-solid border-white inset-0 pointer-events-none" />
        <div className="h-[5px] relative shrink-0 w-[10px]">
          <div className="absolute inset-[-20%_-10%_-28.28%_-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.41422">
              <path d="M1 1L5.96894 6L11 1" id="Vector 1" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Status1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center px-[10px] relative shrink-0 w-[200px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[12px] text-center text-white tracking-[-0.12px]" style={{ fontFeatureSettings: "\'ss01\', \'cv01\', \'cv11\'" }}>
        <p className="leading-[14px] whitespace-pre-wrap">Seller Access</p>
      </div>
      <div className="content-stretch flex flex-col h-[20px] items-center justify-center pl-[10px] pr-[15px] py-[10px] relative shrink-0" data-name="Column Filter">
        <div aria-hidden="true" className="absolute border-r border-solid border-white inset-0 pointer-events-none" />
        <div className="h-[5px] relative shrink-0 w-[10px]">
          <div className="absolute inset-[-20%_-10%_-28.28%_-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.41422">
              <path d="M1 1L5.96894 6L11 1" id="Vector 1" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return <div className="h-[40px] shrink-0 w-[38px]" />;
}

function Header() {
  return (
    <div className="bg-[#211a3a] content-stretch flex gap-[10px] h-[40px] items-center relative shrink-0 w-full" data-name="Header">
      <UserName />
      <FirstName />
      <LastName />
      <Partner />
      <PartnerType />
      <Status />
      <Status1 />
      <Frame3 />
    </div>
  );
}

function UserName1() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-between p-[10px] relative shrink-0 w-[450px]" data-name="User Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">$1M One-Time Online Sub-Prime Installment Loan Portfolio Opportunity</p>
      </div>
    </div>
  );
}

function FirstName1() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="First Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Select Offering Group</p>
      </div>
    </div>
  );
}

function LastName1() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[140px]" data-name="Last Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
    </div>
  );
}

function Partner1() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Partner">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">PH Financial</p>
      </div>
    </div>
  );
}

function PartnerType1() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[420px]" data-name="Partner Type">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Viewable by Administrators</p>
      </div>
    </div>
  );
}

function Status2() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[240px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Private, can update until close</p>
      </div>
    </div>
  );
}

function Status3() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">No Visibility</p>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#e0dfdf] border-b border-solid inset-0 pointer-events-none" />
      <UserName1 />
      <FirstName1 />
      <LastName1 />
      <Partner1 />
      <PartnerType1 />
      <Status2 />
      <Status3 />
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[10px] relative shrink-0 size-[38px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UserName2() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-between p-[10px] relative shrink-0 w-[450px]" data-name="User Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">$245 One-time Multi Segment Commercial Portfolio</p>
      </div>
    </div>
  );
}

function FirstName2() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="First Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Select Offering Group</p>
      </div>
    </div>
  );
}

function LastName2() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[140px]" data-name="Last Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">4</p>
      </div>
    </div>
  );
}

function Partner2() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Partner">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">DLL Financial Solutions Partner</p>
      </div>
    </div>
  );
}

function PartnerType2() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[420px]" data-name="Partner Type">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Open for Bids</p>
      </div>
    </div>
  );
}

function Status4() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[240px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Private, can update until close</p>
      </div>
    </div>
  );
}

function Status5() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">No Visibility</p>
      </div>
    </div>
  );
}

function Row1() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#e0dfdf] border-b border-solid inset-0 pointer-events-none" />
      <UserName2 />
      <FirstName2 />
      <LastName2 />
      <Partner2 />
      <PartnerType2 />
      <Status4 />
      <Status5 />
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[10px] relative shrink-0 size-[38px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UserName3() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-between p-[10px] relative shrink-0 w-[450px]" data-name="User Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">2022 - CreditNinja Fresh IL FF</p>
      </div>
    </div>
  );
}

function FirstName3() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="First Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Credit Ninja 2023</p>
      </div>
    </div>
  );
}

function LastName3() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[140px]" data-name="Last Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">3</p>
      </div>
    </div>
  );
}

function Partner3() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Partner">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Credit Ninja</p>
      </div>
    </div>
  );
}

function PartnerType3() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[420px]" data-name="Partner Type">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Closed, not visible to buyers (unless Doc outstanding or bid won)</p>
      </div>
    </div>
  );
}

function Status6() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[240px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Private, can update until close</p>
      </div>
    </div>
  );
}

function Status7() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">No Visibility</p>
      </div>
    </div>
  );
}

function Row2() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#e0dfdf] border-b border-solid inset-0 pointer-events-none" />
      <UserName3 />
      <FirstName3 />
      <LastName3 />
      <Partner3 />
      <PartnerType3 />
      <Status6 />
      <Status7 />
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[10px] relative shrink-0 size-[38px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UserName4() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-between p-[10px] relative shrink-0 w-[450px]" data-name="User Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">2023 - Credit Ninja Fresh IL FF</p>
      </div>
    </div>
  );
}

function FirstName4() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="First Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Credit Ninja 2023</p>
      </div>
    </div>
  );
}

function LastName4() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[140px]" data-name="Last Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">2</p>
      </div>
    </div>
  );
}

function Partner4() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Partner">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Credit Ninja</p>
      </div>
    </div>
  );
}

function PartnerType4() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[420px]" data-name="Partner Type">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Closed, not visible to buyers (unless Doc outstanding or bid won)</p>
      </div>
    </div>
  );
}

function Status8() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[240px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Private, can update until close</p>
      </div>
    </div>
  );
}

function Status9() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Full Visibility</p>
      </div>
    </div>
  );
}

function Row3() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#e0dfdf] border-b border-solid inset-0 pointer-events-none" />
      <UserName4 />
      <FirstName4 />
      <LastName4 />
      <Partner4 />
      <PartnerType4 />
      <Status8 />
      <Status9 />
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[10px] relative shrink-0 size-[38px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UserName5() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-between p-[10px] relative shrink-0 w-[450px]" data-name="User Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">2023 ADF Fresh unsecured Personal Loan</p>
      </div>
    </div>
  );
}

function FirstName5() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="First Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">ADF Fresh Unsecured PL FF</p>
      </div>
    </div>
  );
}

function LastName5() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[140px]" data-name="Last Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">3</p>
      </div>
    </div>
  );
}

function Partner5() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Partner">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Applied Data Finance</p>
      </div>
    </div>
  );
}

function PartnerType5() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[420px]" data-name="Partner Type">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Closed, not visible to buyers (unless Doc outstanding or bid won)</p>
      </div>
    </div>
  );
}

function Status10() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[240px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Private, can update until close</p>
      </div>
    </div>
  );
}

function Status11() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">No Visibility</p>
      </div>
    </div>
  );
}

function Row4() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#e0dfdf] border-b border-solid inset-0 pointer-events-none" />
      <UserName5 />
      <FirstName5 />
      <LastName5 />
      <Partner5 />
      <PartnerType5 />
      <Status10 />
      <Status11 />
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[10px] relative shrink-0 size-[38px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UserName6() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-between p-[10px] relative shrink-0 w-[450px]" data-name="User Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Brinks - $60M Warehouse and Forward Flow Offering</p>
      </div>
    </div>
  );
}

function FirstName6() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="First Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Select Offering Group</p>
      </div>
    </div>
  );
}

function LastName6() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[140px]" data-name="Last Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">4</p>
      </div>
    </div>
  );
}

function Partner6() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Partner">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Brinks Home Security</p>
      </div>
    </div>
  );
}

function PartnerType6() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[420px]" data-name="Partner Type">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Viewable by Sellers and Buyers</p>
      </div>
    </div>
  );
}

function Status12() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[240px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Private, can update until close</p>
      </div>
    </div>
  );
}

function Status13() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">No Visibility</p>
      </div>
    </div>
  );
}

function Row5() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#e0dfdf] border-b border-solid inset-0 pointer-events-none" />
      <UserName6 />
      <FirstName6 />
      <LastName6 />
      <Partner6 />
      <PartnerType6 />
      <Status12 />
      <Status13 />
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[10px] relative shrink-0 size-[38px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UserName7() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-between p-[10px] relative shrink-0 w-[450px]" data-name="User Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">3 Consumer Loan Forward Flow Opportunities - 12 Month Term 2024</p>
      </div>
    </div>
  );
}

function FirstName7() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="First Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Select Offering Group</p>
      </div>
    </div>
  );
}

function LastName7() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[140px]" data-name="Last Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">3</p>
      </div>
    </div>
  );
}

function Partner7() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Partner">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">CURO Group Holdings Corp</p>
      </div>
    </div>
  );
}

function PartnerType7() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[420px]" data-name="Partner Type">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Closed, visible to buyers</p>
      </div>
    </div>
  );
}

function Status14() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[240px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Private, can update until close</p>
      </div>
    </div>
  );
}

function Status15() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">No Visibility</p>
      </div>
    </div>
  );
}

function Row6() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#e0dfdf] border-b border-solid inset-0 pointer-events-none" />
      <UserName7 />
      <FirstName7 />
      <LastName7 />
      <Partner7 />
      <PartnerType7 />
      <Status14 />
      <Status15 />
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[10px] relative shrink-0 size-[38px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UserName8() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-between p-[10px] relative shrink-0 w-[450px]" data-name="User Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">One Agency One-Time Warehouse</p>
      </div>
    </div>
  );
}

function FirstName8() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="First Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Select Offering Group</p>
      </div>
    </div>
  );
}

function LastName8() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[140px]" data-name="Last Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">3</p>
      </div>
    </div>
  );
}

function Partner8() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Partner">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Advance Financial</p>
      </div>
    </div>
  );
}

function PartnerType8() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[420px]" data-name="Partner Type">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Closed, visible to buyers</p>
      </div>
    </div>
  );
}

function Status16() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[240px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Private, can update until close</p>
      </div>
    </div>
  );
}

function Status17() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Full Visibility</p>
      </div>
    </div>
  );
}

function Row7() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#e0dfdf] border-b border-solid inset-0 pointer-events-none" />
      <UserName8 />
      <FirstName8 />
      <LastName8 />
      <Partner8 />
      <PartnerType8 />
      <Status16 />
      <Status17 />
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[10px] relative shrink-0 size-[38px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UserName9() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-between p-[10px] relative shrink-0 w-[450px]" data-name="User Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Advance Financial - $33.6M Loc and IL</p>
      </div>
    </div>
  );
}

function FirstName9() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="First Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Select Offering Group</p>
      </div>
    </div>
  );
}

function LastName9() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[140px]" data-name="Last Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">1</p>
      </div>
    </div>
  );
}

function Partner9() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Partner">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Advance Financial</p>
      </div>
    </div>
  );
}

function PartnerType9() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[420px]" data-name="Partner Type">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Closed, visible to buyers</p>
      </div>
    </div>
  );
}

function Status18() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[240px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Private, can update until close</p>
      </div>
    </div>
  );
}

function Status19() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">No Visibility</p>
      </div>
    </div>
  );
}

function Row8() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#e0dfdf] border-b border-solid inset-0 pointer-events-none" />
      <UserName9 />
      <FirstName9 />
      <LastName9 />
      <Partner9 />
      <PartnerType9 />
      <Status18 />
      <Status19 />
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[10px] relative shrink-0 size-[38px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UserName10() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-between p-[10px] relative shrink-0 w-[450px]" data-name="User Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">LendCare - DNF</p>
      </div>
    </div>
  );
}

function FirstName10() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="First Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">LendCare</p>
      </div>
    </div>
  );
}

function LastName10() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[140px]" data-name="Last Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">1</p>
      </div>
    </div>
  );
}

function Partner10() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Partner">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">LendCare</p>
      </div>
    </div>
  );
}

function PartnerType10() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[420px]" data-name="Partner Type">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Closed, not visible to buyers (unless Doc outstanding or bid won)</p>
      </div>
    </div>
  );
}

function Status20() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[240px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Private, can update until close</p>
      </div>
    </div>
  );
}

function Status21() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">No Visibility</p>
      </div>
    </div>
  );
}

function Row9() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#e0dfdf] border-b border-solid inset-0 pointer-events-none" />
      <UserName10 />
      <FirstName10 />
      <LastName10 />
      <Partner10 />
      <PartnerType10 />
      <Status20 />
      <Status21 />
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[10px] relative shrink-0 size-[38px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UserName11() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-between p-[10px] relative shrink-0 w-[450px]" data-name="User Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">LendCare - GCS</p>
      </div>
    </div>
  );
}

function FirstName11() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="First Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">LendCare</p>
      </div>
    </div>
  );
}

function LastName11() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[140px]" data-name="Last Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">1</p>
      </div>
    </div>
  );
}

function Partner11() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Partner">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">LendCare</p>
      </div>
    </div>
  );
}

function PartnerType11() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[420px]" data-name="Partner Type">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Closed, visible to buyers</p>
      </div>
    </div>
  );
}

function Status22() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[240px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Private, can update until close</p>
      </div>
    </div>
  );
}

function Status23() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Full Visibility</p>
      </div>
    </div>
  );
}

function Row10() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#e0dfdf] border-b border-solid inset-0 pointer-events-none" />
      <UserName11 />
      <FirstName11 />
      <LastName11 />
      <Partner11 />
      <PartnerType11 />
      <Status22 />
      <Status23 />
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[10px] relative shrink-0 size-[38px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UserName12() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-between p-[10px] relative shrink-0 w-[450px]" data-name="User Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">2025 ADF Fresh Unsecured Personal Loan</p>
      </div>
    </div>
  );
}

function FirstName12() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="First Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">ADF Fresh Unsecured PL FF</p>
      </div>
    </div>
  );
}

function LastName12() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[140px]" data-name="Last Name">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">1</p>
      </div>
    </div>
  );
}

function Partner12() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Partner">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Applied Data Finance</p>
      </div>
    </div>
  );
}

function PartnerType12() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[420px]" data-name="Partner Type">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Closed, visible to buyers</p>
      </div>
    </div>
  );
}

function Status24() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[240px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">Private, can update until close</p>
      </div>
    </div>
  );
}

function Status25() {
  return (
    <div className="content-stretch flex items-center justify-between p-[10px] relative shrink-0 w-[200px]" data-name="Status">
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[12px] text-left">
        <p className="leading-[normal] whitespace-pre-wrap">No Visibility</p>
      </div>
    </div>
  );
}

function Row11() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#e0dfdf] border-b border-solid inset-0 pointer-events-none" />
      <UserName12 />
      <FirstName12 />
      <LastName12 />
      <Partner12 />
      <PartnerType12 />
      <Status24 />
      <Status25 />
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[10px] relative shrink-0 size-[38px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full">
      <div className="bg-white content-stretch flex flex-col gap-[10px] h-[780px] items-start overflow-x-clip overflow-y-auto relative shrink-0" data-name="Table - Lists of Offerings">
        <Header />
        <button className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0 w-full" data-name="Row - Data">
          <Row />
        </button>
        <button className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0 w-full" data-name="Row - Data">
          <Row1 />
        </button>
        <button className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0 w-full" data-name="Row - Data">
          <Row2 />
        </button>
        <button className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0 w-full" data-name="Row - Data">
          <Row3 />
        </button>
        <button className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0 w-full" data-name="Row - Data">
          <Row4 />
        </button>
        <button className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0 w-full" data-name="Row - Data">
          <Row5 />
        </button>
        <button className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0 w-full" data-name="Row - Data">
          <Row6 />
        </button>
        <button className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0 w-full" data-name="Row - Data">
          <Row7 />
        </button>
        <button className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0 w-full" data-name="Row - Data">
          <Row8 />
        </button>
        <button className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0 w-full" data-name="Row - Data">
          <Row9 />
        </button>
        <button className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0 w-full" data-name="Row - Data">
          <Row10 />
        </button>
        <button className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0 w-full" data-name="Row - Data">
          <Row11 />
        </button>
      </div>
    </div>
  );
}

function HorizontalScrollbar() {
  return (
    <div className="bg-[#acacac] h-[10px] relative rounded-[5px] shrink-0 w-full" data-name="Horizontal Scrollbar">
      <div className="content-stretch flex flex-col items-start p-px relative size-full">
        <div className="flex h-[8px] items-center justify-center relative shrink-0 w-[650px]" style={{ "--transform-inner-width": "1186.171875", "--transform-inner-height": "0" } as React.CSSProperties}>
          <div className="-rotate-90 flex-none">
            <div className="bg-[#5b5b5b] h-[650px] rounded-[20px] w-[8px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Offerings() {
  return (
    <div className="bg-white content-stretch flex items-center relative size-full" data-name="Offerings">
      <div className="bg-[#4d4085] content-stretch flex flex-col gap-[5px] h-[900px] items-end overflow-clip pt-[20px] relative shrink-0 w-[180px]" data-name="Left Sidebar">
        <Frame1 />
        <Frame2 />
        <div className="content-stretch flex flex-[1_0_0] items-start justify-between min-h-px min-w-px overflow-clip py-[20px] relative w-[170px]" data-name="Nav 1440px">
          <Dashboard />
        </div>
      </div>
      <div className="bg-white flex-[1_0_0] h-[900px] min-h-px min-w-px relative" data-name="Offerings - Content Area">
        <div className="overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex flex-col gap-[10px] items-start p-[20px] relative size-full">
            <InnerFrame />
            <Frame />
            <HorizontalScrollbar />
          </div>
        </div>
      </div>
    </div>
  );
}