import svgPaths from "./svg-70mw3ckvdj";

function Frame17() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Montserrat:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#4d4085] text-[27px]">Document Template Management</p>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex flex-col items-start py-[5px] relative shrink-0 w-[814px]">
      <Frame17 />
    </div>
  );
}

function Top() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Top">
      <Frame19 />
    </div>
  );
}

function Name() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Name">
      <div className="content-stretch flex gap-[10px] items-start leading-[20px] pr-[10px] py-[5px] relative text-[#1c1c1c] w-full">
        <p className="font-['Montserrat:Bold',sans-serif] font-bold relative shrink-0 text-[18px] tracking-[-0.18px]">{`Template Name: `}</p>
        <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold relative shrink-0 text-[24px] tracking-[-0.24px]">Assessment Docs - SAM Due Diligence</p>
      </div>
    </div>
  );
}

function Template() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Template">
      <Name />
    </div>
  );
}

function Name1() {
  return (
    <div className="content-stretch flex gap-[10px] items-start leading-[20px] pr-[10px] py-[5px] relative shrink-0 text-[#1c1c1c]" data-name="Name">
      <p className="font-['Montserrat:Bold',sans-serif] font-bold relative shrink-0 text-[18px] tracking-[-0.18px]">{`Template Type: `}</p>
      <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold relative shrink-0 text-[24px] tracking-[-0.24px]">Buyer SAM Document</p>
      <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold relative shrink-0 text-[24px] tracking-[-0.24px]">-</p>
    </div>
  );
}

function Description() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative self-stretch" data-name="Description">
      <p className="font-['Montserrat:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1c] text-[24px] tracking-[-0.24px]">To be completed by buyers.</p>
    </div>
  );
}

function TemplateType() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Template Type">
      <Name1 />
      <Description />
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="Header">
      <Top />
      <Template />
      <TemplateType />
      <div className="bg-white content-stretch flex gap-[10px] items-start pt-[20px] relative shrink-0 w-[1220px]" data-name="Inner Tabs">
        <div className="content-stretch flex flex-col gap-[5px] items-center justify-center pt-[5px] px-[10px] relative shrink-0" data-name="Tabs Items">
          <p className="font-['Montserrat:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#46367f] text-[18px] text-center">Configuration</p>
          <div className="h-0 relative shrink-0 w-full" data-name="Indicator">
            <div className="absolute inset-[-1px_-0.76%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 133 2">
                <path d="M1 1H132" id="Indicator" stroke="var(--stroke-0, #46367F)" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
        <button className="content-stretch cursor-pointer flex items-center justify-center px-[11px] py-[5px] relative shrink-0" data-name="Tabs Items">
          <p className="font-['Montserrat:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#3a3a3a] text-[18px] text-center">Fields</p>
        </button>
      </div>
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Montserrat:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[#5ea7a3] text-[21px]">{`Template Configuration `}</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px relative">
      <Frame18 />
    </div>
  );
}

function Buttons() {
  return (
    <div className="content-stretch flex gap-[20px] h-full items-center justify-end relative shrink-0 w-[500px]" data-name="Buttons">
      <button className="bg-white cursor-pointer h-[49px] relative rounded-[100px] shrink-0 w-[150px]">
        <div aria-hidden="true" className="absolute border border-[#46367f] border-solid inset-0 pointer-events-none rounded-[100px]" />
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[80px] py-[12px] relative size-full">
            <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#5ea7a3] text-[14px] text-left">Exit</p>
          </div>
        </div>
      </button>
      <div className="bg-[#46367f] content-stretch flex h-[49px] items-center justify-center px-[50px] py-[12px] relative rounded-[100px] shrink-0 w-[150px]" data-name="Button">
        <div aria-hidden="true" className="absolute border border-[#46367f] border-solid inset-0 pointer-events-none rounded-[100px]" />
        <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">Preview</p>
      </div>
      <div className="bg-[#46367f] content-stretch flex h-[49px] items-center justify-center px-[50px] py-[12px] relative rounded-[100px] shrink-0 w-[150px]" data-name="Button">
        <div aria-hidden="true" className="absolute border border-[#46367f] border-solid inset-0 pointer-events-none rounded-[100px]" />
        <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">Save</p>
      </div>
    </div>
  );
}

function Header2() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Header">
      <Frame />
      <div className="flex flex-row items-center self-stretch">
        <Buttons />
      </div>
    </div>
  );
}

function Header1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Header">
      <Header2 />
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[160px]" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black w-[118px] whitespace-pre-wrap">Template Name:</p>
    </div>
  );
}

function TextField() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[20px] py-[10px] relative w-full">
          <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px]">
            <p className="leading-[normal] whitespace-pre-wrap">Assessment Docs - SAM Due Diligence</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateName() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0 w-full" data-name="Template Name">
      <Label />
      <TextField />
    </div>
  );
}

function Label1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Label">
      <p className="col-1 font-['Poppins:Medium',sans-serif] leading-[normal] ml-0 mt-0 not-italic relative row-1 text-[14px] text-black w-[160px] whitespace-pre-wrap">Decription:</p>
    </div>
  );
}

function TextField1() {
  return (
    <div className="bg-white flex-[1_0_0] h-[75px] min-h-px min-w-px relative rounded-[10px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="content-stretch flex items-start justify-between px-[20px] py-[10px] relative size-full">
        <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px]">
          <p className="leading-[normal] whitespace-pre-wrap">Attachments for SAM Due Diligence</p>
        </div>
      </div>
    </div>
  );
}

function Description1() {
  return (
    <div className="content-stretch flex gap-[10px] h-[85px] items-start py-[5px] relative shrink-0 w-full" data-name="Description">
      <Label1 />
      <TextField1 />
    </div>
  );
}

function Label2() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[160px]" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">Folder Path:</p>
    </div>
  );
}

function TextField2() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[20px] py-[10px] relative w-full">
          <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px]">
            <p className="leading-[normal] whitespace-pre-wrap">/data/offerings/project_titan/documents/final/</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderPath() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0 w-full" data-name="Folder Path">
      <Label2 />
      <TextField2 />
    </div>
  );
}

function Label3() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[160px]" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">Display Name:</p>
    </div>
  );
}

function TextField3() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[20px] py-[10px] relative w-full">
          <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px]">
            <p className="leading-[normal] whitespace-pre-wrap">AD - SAM Due Diligence</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DisplayName() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0 w-full" data-name="Display Name">
      <Label3 />
      <TextField3 />
    </div>
  );
}

function Label4() {
  return (
    <div className="content-stretch flex items-center pr-[5px] py-[5px] relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">Internal Only:</p>
    </div>
  );
}

function Checkbox() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Checkbox">
      <div className="absolute bg-white border border-[#46367f] border-solid inset-0 rounded-[5px]" />
    </div>
  );
}

function InternalOnly() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Internal Only">
      <Label4 />
      <button className="content-stretch cursor-pointer flex items-center relative shrink-0" data-name="Check Box">
        <Checkbox />
      </button>
    </div>
  );
}

function Label5() {
  return (
    <div className="content-stretch flex items-center pr-[5px] py-[5px] relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">Read Only (Edit):</p>
    </div>
  );
}

function Checkbox1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Checkbox">
      <div className="absolute bg-white border border-[#46367f] border-solid inset-0 rounded-[5px]" />
    </div>
  );
}

function ReadOnly() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Read Only">
      <Label5 />
      <button className="content-stretch cursor-pointer flex items-center relative shrink-0" data-name="Check Box">
        <Checkbox1 />
      </button>
    </div>
  );
}

function Label6() {
  return (
    <div className="content-stretch flex items-center pr-[5px] py-[5px] relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">Requires Approval:</p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[30%_20%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.6 6.4">
        <g id="Group">
          <path d={svgPaths.p13bf6f00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[30%_20%]" data-name="Group">
      <Group1 />
    </div>
  );
}

function Checkbox2() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[16px]" data-name="Checkbox">
      <div className="absolute bg-[#46367f] border border-[#46367f] border-solid inset-0 rounded-[5px]" />
      <Group />
    </div>
  );
}

function ReadOnly1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Read Only">
      <Label6 />
      <button className="content-stretch cursor-pointer flex items-center relative shrink-0" data-name="Check Box">
        <Checkbox2 />
      </button>
    </div>
  );
}

function CheckBoxes() {
  return (
    <div className="content-stretch flex gap-[50px] items-center py-[20px] relative shrink-0 w-full" data-name="Check Boxes">
      <InternalOnly />
      <ReadOnly />
      <ReadOnly1 />
    </div>
  );
}

function Label8() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0 w-[160px]" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">Report Template Type:</p>
    </div>
  );
}

function Label7() {
  return (
    <div className="content-stretch flex h-[25px] items-center relative shrink-0" data-name="Label">
      <Label8 />
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">Certificate of Destruction</p>
      </div>
    </div>
  );
}

function Dropdown() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[30px] py-[10px] relative w-full">
          <Frame20 />
          <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[25px]" data-name="Selection Arrow (Big)">
            <div className="h-[9.5px] relative shrink-0 w-[19px]">
              <div className="absolute inset-[-10.53%_-5.26%_-14.89%_-5.26%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11.9142">
                  <path d="M1 1L10.5 10.5L20 1" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportTemplateType() {
  return (
    <div className="content-stretch flex gap-[20px] h-[65px] items-center py-[10px] relative shrink-0 w-full" data-name="Report Template Type">
      <Label7 />
      <Dropdown />
    </div>
  );
}

function Label10() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black w-[156px] whitespace-pre-wrap">Layout:</p>
    </div>
  );
}

function Label9() {
  return (
    <div className="content-stretch flex h-[25px] items-center relative shrink-0 w-[160px]" data-name="Label">
      <Label10 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">Fields right of text</p>
      </div>
    </div>
  );
}

function Dropdown1() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[30px] py-[10px] relative w-full">
          <Frame21 />
          <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[25px]" data-name="Selection Arrow (Big)">
            <div className="h-[9.5px] relative shrink-0 w-[19px]">
              <div className="absolute inset-[-10.53%_-5.26%_-14.89%_-5.26%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11.9142">
                  <path d="M1 1L10.5 10.5L20 1" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Layout() {
  return (
    <div className="content-stretch flex gap-[20px] h-[65px] items-center py-[10px] relative shrink-0 w-full" data-name="Layout">
      <Label9 />
      <Dropdown1 />
    </div>
  );
}

function InitialInformations() {
  return (
    <div className="h-[514px] relative shrink-0 w-full" data-name="Initial Informations">
      <div className="content-stretch flex flex-col gap-[10px] items-start px-[10px] relative size-full">
        <TemplateName />
        <Description1 />
        <FolderPath />
        <DisplayName />
        <CheckBoxes />
        <ReportTemplateType />
        <Layout />
      </div>
    </div>
  );
}

function Label11() {
  return (
    <div className="content-stretch flex items-center py-[5px] relative shrink-0 w-full" data-name="Label">
      <p className="flex-[1_0_0] font-['Montserrat:Bold',sans-serif] font-bold leading-[normal] min-h-px min-w-px relative text-[18px] text-black whitespace-pre-wrap">Administration Notification Settings</p>
    </div>
  );
}

function Checkbox3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Checkbox">
      <div className="absolute bg-white border border-[#46367f] border-solid inset-0 rounded-[5px]" />
    </div>
  );
}

function CheckBox() {
  return (
    <div className="content-stretch flex items-center py-[5px] relative shrink-0" data-name="Check Box">
      <button className="content-stretch cursor-pointer flex items-center relative shrink-0" data-name="Check Box">
        <Checkbox3 />
      </button>
    </div>
  );
}

function Label12() {
  return (
    <div className="content-stretch flex items-start pb-[5px] pr-[5px] relative shrink-0 w-[167px]" data-name="Label">
      <div className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-black whitespace-pre-wrap">
        <p className="mb-0">Notify when document</p>
        <p>changed</p>
      </div>
    </div>
  );
}

function NotifyWhenChanged() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0" data-name="Notify when changed">
      <CheckBox />
      <Label12 />
    </div>
  );
}

function Checkbox4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Checkbox">
      <div className="absolute bg-white border border-[#46367f] border-solid inset-0 rounded-[5px]" />
    </div>
  );
}

function CheckBox1() {
  return (
    <div className="content-stretch flex items-center py-[5px] relative shrink-0" data-name="Check Box">
      <button className="content-stretch cursor-pointer flex items-center relative shrink-0" data-name="Check Box">
        <Checkbox4 />
      </button>
    </div>
  );
}

function Label13() {
  return (
    <div className="content-stretch flex items-start pb-[5px] pr-[5px] relative shrink-0 w-[177px]" data-name="Label">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-black whitespace-pre-wrap">Notify when attachment uploaded</p>
    </div>
  );
}

function NotifyWhenUploaded() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0" data-name="Notify when uploaded">
      <CheckBox1 />
      <Label13 />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute inset-[30%_20%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.6 6.4">
        <g id="Group">
          <path d={svgPaths.p13bf6f00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[30%_20%]" data-name="Group">
      <Group3 />
    </div>
  );
}

function Checkbox5() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[16px]" data-name="Checkbox">
      <div className="absolute bg-[#46367f] border border-[#46367f] border-solid inset-0 rounded-[5px]" />
      <Group2 />
    </div>
  );
}

function CheckBox2() {
  return (
    <div className="content-stretch flex items-center py-[5px] relative shrink-0" data-name="Check Box">
      <button className="content-stretch cursor-pointer flex items-center relative shrink-0" data-name="Check Box">
        <Checkbox5 />
      </button>
    </div>
  );
}

function Label14() {
  return (
    <div className="content-stretch flex items-start pb-[5px] pr-[5px] relative shrink-0 w-[274px]" data-name="Label">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-black whitespace-pre-wrap">Suppress notification when document completed, if no required fields</p>
    </div>
  );
}

function SupressNotification() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0" data-name="Supress notification">
      <CheckBox2 />
      <Label14 />
    </div>
  );
}

function CheckBoxes1() {
  return (
    <div className="content-stretch flex gap-[50px] items-center relative shrink-0 w-[1180px]" data-name="Check Boxes">
      <NotifyWhenChanged />
      <NotifyWhenUploaded />
      <SupressNotification />
    </div>
  );
}

function InitialInformations1() {
  return (
    <div className="h-[110px] relative shrink-0 w-full" data-name="Initial Informations">
      <div className="content-stretch flex flex-col gap-[10px] items-start p-[10px] relative size-full">
        <Label11 />
        <CheckBoxes1 />
      </div>
    </div>
  );
}

function Label15() {
  return (
    <div className="content-stretch flex h-[33px] items-center py-[5px] relative shrink-0 w-full" data-name="Label">
      <p className="flex-[1_0_0] font-['Montserrat:Bold',sans-serif] font-bold leading-[normal] min-h-px min-w-px relative text-[18px] text-black whitespace-pre-wrap">Document-Specific Notification Settings (Optional)</p>
    </div>
  );
}

function Label17() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black w-[156px] whitespace-pre-wrap">Deadline reminder: Calendar Item</p>
    </div>
  );
}

function Label16() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[160px]" data-name="Label">
      <div className="flex flex-row items-center self-stretch">
        <Label17 />
      </div>
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">Friday, October 22, 2021</p>
      </div>
    </div>
  );
}

function Dropdown2() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[30px] py-[10px] relative w-full">
          <Frame22 />
          <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[25px]" data-name="Selection Arrow (Big)">
            <div className="h-[9.5px] relative shrink-0 w-[19px]">
              <div className="absolute inset-[-10.53%_-5.26%_-14.89%_-5.26%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11.9142">
                  <path d="M1 1L10.5 10.5L20 1" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineReminderCalendarItem() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[20px] h-[65px] items-center min-h-px min-w-px py-[10px] relative" data-name="Deadline reminder - Calendar Item">
      <Label16 />
      <Dropdown2 />
    </div>
  );
}

function Label18() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[140px]" data-name="Label">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[0] min-h-px min-w-px not-italic relative text-[14px] text-black whitespace-pre-wrap">
        <span className="leading-[normal]">Deadline reminder:</span>
        <span className="leading-[normal]">
          <br aria-hidden="true" />
        </span>
        <span className="leading-[normal]"># if hour prior</span>
      </p>
    </div>
  );
}

function TextField4() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[30px] shrink-0 w-[77px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px] text-center">
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
    </div>
  );
}

function Counter() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Counter">
      <div className="flex items-center justify-center relative self-stretch shrink-0">
        <div className="-scale-y-100 flex-none h-full rotate-180">
          <button className="content-stretch cursor-pointer flex flex-col h-full items-center justify-center overflow-clip p-[10px] relative w-[30px]" data-name="Go To">
            <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
                <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      <TextField4 />
      <button className="content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip p-[10px] relative self-stretch shrink-0 w-[30px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </button>
    </div>
  );
}

function DeadlineReminderIfHourPrior() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0" data-name="Deadline reminder: # if hour prior">
      <Label18 />
      <Counter />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[30px] items-center relative shrink-0 w-[1180px]">
      <DeadlineReminderCalendarItem />
      <DeadlineReminderIfHourPrior />
    </div>
  );
}

function Label19() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[185px]" data-name="Label">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-black whitespace-pre-wrap">Document due reminder: Every X days</p>
    </div>
  );
}

function TextField5() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[30px] shrink-0 w-[77px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px] text-center">
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
    </div>
  );
}

function Counter1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Counter">
      <div className="flex items-center justify-center relative self-stretch shrink-0">
        <div className="-scale-y-100 flex-none h-full rotate-180">
          <button className="content-stretch cursor-pointer flex flex-col h-full items-center justify-center overflow-clip p-[10px] relative w-[30px]" data-name="Go To">
            <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
                <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      <TextField5 />
      <button className="content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip p-[10px] relative self-stretch shrink-0 w-[30px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </button>
    </div>
  );
}

function DocumentDueReminderEveryXDays() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0 w-[350px]" data-name="Document due reminder: Every X days">
      <Label19 />
      <Counter1 />
    </div>
  );
}

function Label20() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[185px]" data-name="Label">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-black whitespace-pre-wrap">Document due reminder: Maximum days</p>
    </div>
  );
}

function TextField6() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[30px] shrink-0 w-[77px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px] text-center">
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
    </div>
  );
}

function Counter2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Counter">
      <div className="flex items-center justify-center relative self-stretch shrink-0">
        <div className="-scale-y-100 flex-none h-full rotate-180">
          <button className="content-stretch cursor-pointer flex flex-col h-full items-center justify-center overflow-clip p-[10px] relative w-[30px]" data-name="Go To">
            <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
                <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      <TextField6 />
      <button className="content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip p-[10px] relative self-stretch shrink-0 w-[30px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </button>
    </div>
  );
}

function DocumentDueReminderMaximumDays() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0 w-[350px]" data-name="Document due reminder: Maximum days">
      <Label20 />
      <Counter2 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[50px] items-center relative shrink-0 w-full">
      <DocumentDueReminderEveryXDays />
      <DocumentDueReminderMaximumDays />
    </div>
  );
}

function Label21() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[185px]" data-name="Label">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-black whitespace-pre-wrap">Incomplete reminder: Every X days</p>
    </div>
  );
}

function TextField7() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[30px] shrink-0 w-[77px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px] text-center">
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
    </div>
  );
}

function Counter3() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Counter">
      <div className="flex items-center justify-center relative self-stretch shrink-0">
        <div className="-scale-y-100 flex-none h-full rotate-180">
          <button className="content-stretch cursor-pointer flex flex-col h-full items-center justify-center overflow-clip p-[10px] relative w-[30px]" data-name="Go To">
            <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
                <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      <TextField7 />
      <button className="content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip p-[10px] relative self-stretch shrink-0 w-[30px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </button>
    </div>
  );
}

function IncompleteReminderEveryXDays() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0 w-[350px]" data-name="Incomplete reminder: Every X days">
      <Label21 />
      <Counter3 />
    </div>
  );
}

function Label22() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[185px]" data-name="Label">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-black whitespace-pre-wrap">Incomplete reminder: Maximum days</p>
    </div>
  );
}

function TextField8() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[30px] shrink-0 w-[77px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px] text-center">
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
    </div>
  );
}

function Counter4() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Counter">
      <div className="flex items-center justify-center relative self-stretch shrink-0">
        <div className="-scale-y-100 flex-none h-full rotate-180">
          <button className="content-stretch cursor-pointer flex flex-col h-full items-center justify-center overflow-clip p-[10px] relative w-[30px]" data-name="Go To">
            <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
                <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      <TextField8 />
      <button className="content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip p-[10px] relative self-stretch shrink-0 w-[30px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </button>
    </div>
  );
}

function DocumentDueReminderMaximumDays1() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0 w-[350px]" data-name="Document due reminder: Maximum days">
      <Label22 />
      <Counter4 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[50px] items-center relative shrink-0 w-full">
      <IncompleteReminderEveryXDays />
      <DocumentDueReminderMaximumDays1 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
      <Frame3 />
      <Frame4 />
    </div>
  );
}

function InitialInformations2() {
  return (
    <div className="h-[195px] relative shrink-0 w-full" data-name="Initial Informations">
      <div className="content-stretch flex flex-col gap-[10px] items-start px-[10px] relative size-full">
        <Frame1 />
        <Frame2 />
      </div>
    </div>
  );
}

function Label23() {
  return (
    <div className="content-stretch flex h-[32px] items-center py-[5px] relative shrink-0 w-full" data-name="Label">
      <p className="flex-[1_0_0] font-['Montserrat:Bold',sans-serif] font-bold leading-[normal] min-h-px min-w-px relative text-[18px] text-black whitespace-pre-wrap">Default Header Configuration</p>
    </div>
  );
}

function Label25() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black w-[156px] whitespace-pre-wrap">Color:</p>
    </div>
  );
}

function Label24() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[160px]" data-name="Label">
      <div className="flex flex-row items-center self-stretch">
        <Label25 />
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Input">
      <div className="relative shrink-0 size-[24px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" fill="var(--fill-0, black)" id="Ellipse 12" r="12" />
        </svg>
      </div>
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">#000000</p>
      </div>
    </div>
  );
}

function Dropdown3() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[30px] py-[10px] relative w-full">
          <Input />
          <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[25px]" data-name="Selection Arrow (Big)">
            <div className="h-[9.5px] relative shrink-0 w-[19px]">
              <div className="absolute inset-[-10.53%_-5.26%_-14.89%_-5.26%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11.9142">
                  <path d="M1 1L10.5 10.5L20 1" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineReminderCalendarItem1() {
  return (
    <div className="content-stretch flex gap-[20px] h-[65px] items-center py-[10px] relative shrink-0 w-[578px]" data-name="Deadline reminder - Calendar Item">
      <Label24 />
      <Dropdown3 />
    </div>
  );
}

function Label26() {
  return (
    <div className="content-stretch flex items-center pr-[5px] py-[5px] relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">Bold</p>
    </div>
  );
}

function Checkbox6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Checkbox">
      <div className="absolute bg-white border border-[#46367f] border-solid inset-0 rounded-[5px]" />
    </div>
  );
}

function TextBold() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Text bold">
      <Label26 />
      <button className="content-stretch cursor-pointer flex items-center relative shrink-0" data-name="Check Box">
        <Checkbox6 />
      </button>
    </div>
  );
}

function Label27() {
  return (
    <div className="content-stretch flex items-center pr-[5px] py-[5px] relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">Underlined</p>
    </div>
  );
}

function Checkbox7() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Checkbox">
      <div className="absolute bg-white border border-[#46367f] border-solid inset-0 rounded-[5px]" />
    </div>
  );
}

function TextUnderlined() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Text underlined">
      <Label27 />
      <button className="content-stretch cursor-pointer flex items-center relative shrink-0" data-name="Check Box">
        <Checkbox7 />
      </button>
    </div>
  );
}

function Label28() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[67px]" data-name="Label">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-black whitespace-pre-wrap">Font Size</p>
    </div>
  );
}

function TextField9() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[30px] shrink-0 w-[77px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px] text-center">
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
    </div>
  );
}

function Counter5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Counter">
      <div className="flex items-center justify-center relative self-stretch shrink-0">
        <div className="-scale-y-100 flex-none h-full rotate-180">
          <button className="content-stretch cursor-pointer flex flex-col h-full items-center justify-center overflow-clip p-[10px] relative w-[30px]" data-name="Go To">
            <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
                <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      <TextField9 />
      <button className="content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip p-[10px] relative self-stretch shrink-0 w-[30px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </button>
    </div>
  );
}

function FontSize() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0" data-name="Font Size">
      <Label28 />
      <Counter5 />
    </div>
  );
}

function CheckBoxes2() {
  return (
    <div className="content-stretch flex gap-[30px] h-full items-center relative shrink-0 w-[450px]" data-name="Check Boxes">
      <TextBold />
      <TextUnderlined />
      <FontSize />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[50px] items-center relative shrink-0 w-[1180px]">
      <DeadlineReminderCalendarItem1 />
      <div className="flex flex-row items-center self-stretch">
        <CheckBoxes2 />
      </div>
    </div>
  );
}

function InitialInformations3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Initial Informations">
      <div className="content-stretch flex flex-col items-start px-[10px] relative w-full">
        <Frame5 />
      </div>
    </div>
  );
}

function Label29() {
  return (
    <div className="content-stretch flex h-[32px] items-center py-[5px] relative shrink-0 w-full" data-name="Label">
      <p className="flex-[1_0_0] font-['Montserrat:Bold',sans-serif] font-bold leading-[normal] min-h-px min-w-px relative text-[18px] text-black whitespace-pre-wrap">Default Prompt Configuration</p>
    </div>
  );
}

function Label31() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black w-[156px] whitespace-pre-wrap">Color:</p>
    </div>
  );
}

function Label30() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[160px]" data-name="Label">
      <div className="flex flex-row items-center self-stretch">
        <Label31 />
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Input">
      <div className="relative shrink-0 size-[24px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" fill="var(--fill-0, black)" id="Ellipse 12" r="12" />
        </svg>
      </div>
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">#000000</p>
      </div>
    </div>
  );
}

function Dropdown4() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[30px] py-[10px] relative w-full">
          <Input1 />
          <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[25px]" data-name="Selection Arrow (Big)">
            <div className="h-[9.5px] relative shrink-0 w-[19px]">
              <div className="absolute inset-[-10.53%_-5.26%_-14.89%_-5.26%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11.9142">
                  <path d="M1 1L10.5 10.5L20 1" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineReminderCalendarItem2() {
  return (
    <div className="content-stretch flex gap-[20px] h-[65px] items-center py-[10px] relative shrink-0 w-[578px]" data-name="Deadline reminder - Calendar Item">
      <Label30 />
      <Dropdown4 />
    </div>
  );
}

function Label32() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[67px]" data-name="Label">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-black whitespace-pre-wrap">Font Size</p>
    </div>
  );
}

function TextField10() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[30px] shrink-0 w-[77px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px] text-center">
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
    </div>
  );
}

function Counter6() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Counter">
      <div className="flex items-center justify-center relative self-stretch shrink-0">
        <div className="-scale-y-100 flex-none h-full rotate-180">
          <button className="content-stretch cursor-pointer flex flex-col h-full items-center justify-center overflow-clip p-[10px] relative w-[30px]" data-name="Go To">
            <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
                <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      <TextField10 />
      <button className="content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip p-[10px] relative self-stretch shrink-0 w-[30px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </button>
    </div>
  );
}

function FontSize1() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0" data-name="Font Size">
      <Label32 />
      <Counter6 />
    </div>
  );
}

function CheckBoxes3() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[450px]" data-name="Check Boxes">
      <FontSize1 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[50px] items-center relative shrink-0 w-[1180px]">
      <DeadlineReminderCalendarItem2 />
      <div className="flex flex-row items-center self-stretch">
        <CheckBoxes3 />
      </div>
    </div>
  );
}

function DefaultPromptConfiguration() {
  return (
    <div className="relative shrink-0 w-full" data-name="Default Prompt Configuration">
      <div className="content-stretch flex flex-col items-start px-[10px] relative w-full">
        <Frame6 />
      </div>
    </div>
  );
}

function Label33() {
  return (
    <div className="content-stretch flex h-[32px] items-center py-[5px] relative shrink-0 w-full" data-name="Label">
      <p className="flex-[1_0_0] font-['Montserrat:Bold',sans-serif] font-bold leading-[normal] min-h-px min-w-px relative text-[18px] text-black whitespace-pre-wrap">Text Box Configuration</p>
    </div>
  );
}

function Label35() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[14px] text-black w-[156px] whitespace-pre-wrap">
        <span className="leading-[normal]">Foreground color</span>
        <span className="leading-[normal]">:</span>
      </p>
    </div>
  );
}

function Label34() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[160px]" data-name="Label">
      <div className="flex flex-row items-center self-stretch">
        <Label35 />
      </div>
    </div>
  );
}

function Input2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Input">
      <div className="relative shrink-0 size-[24px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" fill="var(--fill-0, black)" id="Ellipse 12" r="12" />
        </svg>
      </div>
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">#000000</p>
      </div>
    </div>
  );
}

function Dropdown5() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[30px] py-[10px] relative rounded-[30px] shrink-0 w-[240px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <Input2 />
      <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[25px]" data-name="Selection Arrow (Big)">
        <div className="h-[9.5px] relative shrink-0 w-[19px]">
          <div className="absolute inset-[-10.53%_-5.26%_-14.89%_-5.26%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11.9142">
              <path d="M1 1L10.5 10.5L20 1" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineReminderCalendarItem3() {
  return (
    <div className="content-stretch flex gap-[20px] h-[65px] items-center py-[10px] relative shrink-0 w-[417px]" data-name="Deadline reminder - Calendar Item">
      <Label34 />
      <Dropdown5 />
    </div>
  );
}

function Label37() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[14px] text-black w-[136px] whitespace-pre-wrap">
        <span className="leading-[normal]">Background color</span>
        <span className="leading-[normal]">:</span>
      </p>
    </div>
  );
}

function Label36() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Label">
      <div className="flex flex-row items-center self-stretch">
        <Label37 />
      </div>
    </div>
  );
}

function Input3() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Input">
      <div className="relative shrink-0 size-[24px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" fill="var(--fill-0, #CDF1D0)" id="Ellipse 12" r="12" />
        </svg>
      </div>
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">#CDF1D0</p>
      </div>
    </div>
  );
}

function Dropdown6() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[30px] py-[10px] relative rounded-[30px] shrink-0 w-[240px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <Input3 />
      <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[25px]" data-name="Selection Arrow (Big)">
        <div className="h-[9.5px] relative shrink-0 w-[19px]">
          <div className="absolute inset-[-10.53%_-5.26%_-14.89%_-5.26%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11.9142">
              <path d="M1 1L10.5 10.5L20 1" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineReminderCalendarItem4() {
  return (
    <div className="content-stretch flex gap-[20px] h-[65px] items-center py-[10px] relative shrink-0 w-[417px]" data-name="Deadline reminder - Calendar Item">
      <Label36 />
      <Dropdown6 />
    </div>
  );
}

function Label38() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[67px]" data-name="Label">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-black whitespace-pre-wrap">Font Size</p>
    </div>
  );
}

function TextField11() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[30px] shrink-0 w-[77px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px] text-center">
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
    </div>
  );
}

function Counter7() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Counter">
      <div className="flex items-center justify-center relative self-stretch shrink-0">
        <div className="-scale-y-100 flex-none h-full rotate-180">
          <button className="content-stretch cursor-pointer flex flex-col h-full items-center justify-center overflow-clip p-[10px] relative w-[30px]" data-name="Go To">
            <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
                <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      <TextField11 />
      <button className="content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip p-[10px] relative self-stretch shrink-0 w-[30px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </button>
    </div>
  );
}

function FontSize2() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0" data-name="Font Size">
      <Label38 />
      <Counter7 />
    </div>
  );
}

function CheckBoxes4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-full items-center min-h-px min-w-px relative" data-name="Check Boxes">
      <FontSize2 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[50px] items-center relative shrink-0 w-[1180px]">
      <DeadlineReminderCalendarItem3 />
      <DeadlineReminderCalendarItem4 />
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <CheckBoxes4 />
      </div>
    </div>
  );
}

function DefaultPromptConfiguration1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Default Prompt Configuration">
      <div className="content-stretch flex flex-col items-start px-[10px] relative w-full">
        <Frame7 />
      </div>
    </div>
  );
}

function Label39() {
  return (
    <div className="content-stretch flex h-[32px] items-center py-[5px] relative shrink-0 w-full" data-name="Label">
      <p className="flex-[1_0_0] font-['Montserrat:Bold',sans-serif] font-bold leading-[normal] min-h-px min-w-px relative text-[18px] text-black whitespace-pre-wrap">Custom Images</p>
    </div>
  );
}

function Label41() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black w-[156px] whitespace-pre-wrap">Unselected Image:</p>
    </div>
  );
}

function Label40() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[160px]" data-name="Label">
      <div className="flex flex-row items-center self-stretch">
        <Label41 />
      </div>
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">DS360 Logo with TM 1</p>
      </div>
    </div>
  );
}

function Dropdown7() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[30px] py-[10px] relative w-full">
          <Frame23 />
          <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[25px]" data-name="Selection Arrow (Big)">
            <div className="h-[9.5px] relative shrink-0 w-[19px]">
              <div className="absolute inset-[-10.53%_-5.26%_-14.89%_-5.26%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11.9142">
                  <path d="M1 1L10.5 10.5L20 1" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineReminderCalendarItem5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[20px] h-[65px] items-center min-h-px min-w-px py-[10px] relative" data-name="Deadline reminder - Calendar Item">
      <Label40 />
      <Dropdown7 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[1180px]">
      <DeadlineReminderCalendarItem5 />
    </div>
  );
}

function Label43() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black w-[156px] whitespace-pre-wrap">Selected Image:</p>
    </div>
  );
}

function Label42() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[160px]" data-name="Label">
      <div className="flex flex-row items-center self-stretch">
        <Label43 />
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">Buyer Profile Assessment Checklist</p>
      </div>
    </div>
  );
}

function Dropdown8() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[30px] py-[10px] relative w-full">
          <Frame24 />
          <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[25px]" data-name="Selection Arrow (Big)">
            <div className="h-[9.5px] relative shrink-0 w-[19px]">
              <div className="absolute inset-[-10.53%_-5.26%_-14.89%_-5.26%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11.9142">
                  <path d="M1 1L10.5 10.5L20 1" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineReminderCalendarItem6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[20px] h-[65px] items-center min-h-px min-w-px py-[10px] relative" data-name="Deadline reminder - Calendar Item">
      <Label42 />
      <Dropdown8 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[1180px]">
      <DeadlineReminderCalendarItem6 />
    </div>
  );
}

function Label45() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black w-[156px] whitespace-pre-wrap">Incomplete Image:</p>
    </div>
  );
}

function Label44() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[160px]" data-name="Label">
      <div className="flex flex-row items-center self-stretch">
        <Label45 />
      </div>
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">Document Folder Icon</p>
      </div>
    </div>
  );
}

function Dropdown9() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[30px] py-[10px] relative w-full">
          <Frame25 />
          <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[25px]" data-name="Selection Arrow (Big)">
            <div className="h-[9.5px] relative shrink-0 w-[19px]">
              <div className="absolute inset-[-10.53%_-5.26%_-14.89%_-5.26%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11.9142">
                  <path d="M1 1L10.5 10.5L20 1" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineReminderCalendarItem7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[20px] h-[65px] items-center min-h-px min-w-px py-[10px] relative" data-name="Deadline reminder - Calendar Item">
      <Label44 />
      <Dropdown9 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[1180px]">
      <DeadlineReminderCalendarItem7 />
    </div>
  );
}

function Label47() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black w-[156px] whitespace-pre-wrap">Reclined Image:</p>
    </div>
  );
}

function Label46() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[160px]" data-name="Label">
      <div className="flex flex-row items-center self-stretch">
        <Label47 />
      </div>
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">(Default Image)</p>
      </div>
    </div>
  );
}

function Dropdown10() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[30px] py-[10px] relative w-full">
          <Frame26 />
          <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[25px]" data-name="Selection Arrow (Big)">
            <div className="h-[9.5px] relative shrink-0 w-[19px]">
              <div className="absolute inset-[-10.53%_-5.26%_-14.89%_-5.26%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11.9142">
                  <path d="M1 1L10.5 10.5L20 1" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineReminderCalendarItem8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[20px] h-[65px] items-center min-h-px min-w-px py-[10px] relative" data-name="Deadline reminder - Calendar Item">
      <Label46 />
      <Dropdown10 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[1180px]">
      <DeadlineReminderCalendarItem8 />
    </div>
  );
}

function InitialInformations4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Initial Informations">
      <div className="content-stretch flex flex-col gap-[10px] items-start px-[10px] relative w-full">
        <Frame8 />
        <Frame9 />
        <Frame10 />
        <Frame11 />
      </div>
    </div>
  );
}

function Label48() {
  return (
    <div className="content-stretch flex h-[32px] items-center py-[5px] relative shrink-0 w-full" data-name="Label">
      <p className="flex-[1_0_0] font-['Montserrat:Bold',sans-serif] font-bold leading-[normal] min-h-px min-w-px relative text-[18px] text-black whitespace-pre-wrap">Save Button Configuration</p>
    </div>
  );
}

function Label50() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black w-[156px] whitespace-pre-wrap">Button Text (Label)</p>
    </div>
  );
}

function Label49() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[160px]" data-name="Label">
      <div className="flex flex-row items-center self-stretch">
        <Label50 />
      </div>
    </div>
  );
}

function TextField12() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[30px] py-[10px] relative w-full">
          <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
            <p className="leading-[normal]">SAVE</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineReminderCalendarItem9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[20px] h-[65px] items-center min-h-px min-w-px py-[10px] relative" data-name="Deadline reminder - Calendar Item">
      <Label49 />
      <TextField12 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex h-[65px] items-center relative shrink-0 w-full">
      <DeadlineReminderCalendarItem9 />
    </div>
  );
}

function Label52() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[14px] text-black w-[156px] whitespace-pre-wrap">
        <span className="leading-[normal]">Foreground color</span>
        <span className="leading-[normal]">:</span>
      </p>
    </div>
  );
}

function Label51() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[160px]" data-name="Label">
      <div className="flex flex-row items-center self-stretch">
        <Label52 />
      </div>
    </div>
  );
}

function Input4() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Input">
      <div className="relative shrink-0 size-[24px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" fill="var(--fill-0, black)" id="Ellipse 12" r="12" />
        </svg>
      </div>
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">#000000</p>
      </div>
    </div>
  );
}

function Dropdown11() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[30px] py-[10px] relative rounded-[30px] shrink-0 w-[240px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <Input4 />
      <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[25px]" data-name="Selection Arrow (Big)">
        <div className="h-[9.5px] relative shrink-0 w-[19px]">
          <div className="absolute inset-[-10.53%_-5.26%_-14.89%_-5.26%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11.9142">
              <path d="M1 1L10.5 10.5L20 1" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineReminderCalendarItem10() {
  return (
    <div className="content-stretch flex gap-[20px] h-[65px] items-center py-[10px] relative shrink-0 w-[417px]" data-name="Deadline reminder - Calendar Item">
      <Label51 />
      <Dropdown11 />
    </div>
  );
}

function Label54() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[14px] text-black w-[136px] whitespace-pre-wrap">
        <span className="leading-[normal]">Background color</span>
        <span className="leading-[normal]">:</span>
      </p>
    </div>
  );
}

function Label53() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Label">
      <div className="flex flex-row items-center self-stretch">
        <Label54 />
      </div>
    </div>
  );
}

function Input5() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Input">
      <div className="relative shrink-0 size-[24px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" fill="var(--fill-0, #CDF1D0)" id="Ellipse 12" r="12" />
        </svg>
      </div>
      <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">#CDF1D0</p>
      </div>
    </div>
  );
}

function Dropdown12() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[30px] py-[10px] relative rounded-[30px] shrink-0 w-[240px]" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <Input5 />
      <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[25px]" data-name="Selection Arrow (Big)">
        <div className="h-[9.5px] relative shrink-0 w-[19px]">
          <div className="absolute inset-[-10.53%_-5.26%_-14.89%_-5.26%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 11.9142">
              <path d="M1 1L10.5 10.5L20 1" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineReminderCalendarItem11() {
  return (
    <div className="content-stretch flex gap-[20px] h-[65px] items-center py-[10px] relative shrink-0 w-[417px]" data-name="Deadline reminder - Calendar Item">
      <Label53 />
      <Dropdown12 />
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex gap-[50px] items-center relative shrink-0 w-[1180px]">
      <DeadlineReminderCalendarItem10 />
      <DeadlineReminderCalendarItem11 />
    </div>
  );
}

function DefaultPromptConfiguration2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Default Prompt Configuration">
      <Frame14 />
    </div>
  );
}

function Label55() {
  return (
    <div className="content-stretch flex items-center pr-[5px] py-[5px] relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">Bold</p>
    </div>
  );
}

function Checkbox8() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Checkbox">
      <div className="absolute bg-white border border-[#46367f] border-solid inset-0 rounded-[5px]" />
    </div>
  );
}

function TextBold1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Text bold">
      <Label55 />
      <button className="content-stretch cursor-pointer flex items-center relative shrink-0" data-name="Check Box">
        <Checkbox8 />
      </button>
    </div>
  );
}

function Label56() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[67px]" data-name="Label">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-black whitespace-pre-wrap">Font Size:</p>
    </div>
  );
}

function TextField13() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[30px] shrink-0 w-[77px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px] text-center">
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
    </div>
  );
}

function Counter8() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Counter">
      <div className="flex items-center justify-center relative self-stretch shrink-0">
        <div className="-scale-y-100 flex-none h-full rotate-180">
          <button className="content-stretch cursor-pointer flex flex-col h-full items-center justify-center overflow-clip p-[10px] relative w-[30px]" data-name="Go To">
            <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
                <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      <TextField13 />
      <button className="content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip p-[10px] relative self-stretch shrink-0 w-[30px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </button>
    </div>
  );
}

function FontSize3() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0" data-name="Font Size">
      <Label56 />
      <Counter8 />
    </div>
  );
}

function Label57() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">Height:</p>
    </div>
  );
}

function TextField14() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[30px] shrink-0 w-[77px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px] text-center">
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
    </div>
  );
}

function Counter9() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Counter">
      <div className="flex items-center justify-center relative self-stretch shrink-0">
        <div className="-scale-y-100 flex-none h-full rotate-180">
          <button className="content-stretch cursor-pointer flex flex-col h-full items-center justify-center overflow-clip p-[10px] relative w-[30px]" data-name="Go To">
            <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
                <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      <TextField14 />
      <button className="content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip p-[10px] relative self-stretch shrink-0 w-[30px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </button>
    </div>
  );
}

function Height() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0" data-name="Height">
      <Label57 />
      <Counter9 />
    </div>
  );
}

function Label58() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">Width:</p>
    </div>
  );
}

function TextField15() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[30px] shrink-0 w-[77px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-[1_0_0] flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#3a3a3a] text-[16px] text-center">
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
    </div>
  );
}

function Counter10() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Counter">
      <div className="flex items-center justify-center relative self-stretch shrink-0">
        <div className="-scale-y-100 flex-none h-full rotate-180">
          <button className="content-stretch cursor-pointer flex flex-col h-full items-center justify-center overflow-clip p-[10px] relative w-[30px]" data-name="Go To">
            <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
                <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      <TextField15 />
      <button className="content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip p-[10px] relative self-stretch shrink-0 w-[30px]" data-name="Go To">
        <div className="h-[19px] relative shrink-0 w-[13px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p9a3ac00} fill="var(--fill-0, #46367F)" id="Vector" />
          </svg>
        </div>
      </button>
    </div>
  );
}

function Width() {
  return (
    <div className="content-stretch flex gap-[10px] h-[54px] items-center py-[5px] relative shrink-0" data-name="Width">
      <Label58 />
      <Counter10 />
    </div>
  );
}

function CheckBoxes5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[30px] h-full items-center min-h-px min-w-px relative" data-name="Check Boxes">
      <TextBold1 />
      <FontSize3 />
      <div className="flex h-0 items-center justify-center relative self-center shrink-0 w-0" style={{ "--transform-inner-width": "1186.171875", "--transform-inner-height": "154.359375" } as React.CSSProperties}>
        <div className="flex-none h-full rotate-90">
          <div className="h-full relative w-[54px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 54 1">
                <line id="Line 230" stroke="var(--stroke-0, black)" x2="54" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Height />
      <Width />
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <CheckBoxes5 />
      </div>
    </div>
  );
}

function InitialInformations5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Initial Informations">
      <div className="content-stretch flex flex-col items-start pl-[190px] pr-[10px] relative w-full">
        <Frame15 />
      </div>
    </div>
  );
}

function Label60() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Label">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black w-[156px] whitespace-pre-wrap">Display before last X fields</p>
    </div>
  );
}

function Label59() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[160px]" data-name="Label">
      <div className="flex flex-row items-center self-stretch">
        <Label60 />
      </div>
    </div>
  );
}

function TextField16() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[30px]" data-name="Text Field">
      <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[30px] py-[10px] relative w-full">
          <div className="flex flex-col font-['Poppins:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] whitespace-nowrap">
            <p className="leading-[normal]">-</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineReminderCalendarItem12() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[20px] h-[65px] items-center min-h-px min-w-px py-[10px] relative" data-name="Deadline reminder - Calendar Item">
      <Label59 />
      <TextField16 />
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex h-[65px] items-center relative shrink-0 w-full">
      <DeadlineReminderCalendarItem12 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[10px] items-start px-[10px] relative w-full">
        <Frame13 />
        <DefaultPromptConfiguration2 />
        <InitialInformations5 />
        <Frame16 />
      </div>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px overflow-x-clip overflow-y-auto relative w-full" data-name="Content">
      <InitialInformations />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1200 1">
            <line id="Line 222" stroke="var(--stroke-0, #ACACAC)" x2="1200" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <InitialInformations1 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1200 1">
            <line id="Line 222" stroke="var(--stroke-0, #ACACAC)" x2="1200" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Label15 />
      <InitialInformations2 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1200 1">
            <line id="Line 222" stroke="var(--stroke-0, #ACACAC)" x2="1200" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Label23 />
      <InitialInformations3 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1200 1">
            <line id="Line 222" stroke="var(--stroke-0, #ACACAC)" x2="1200" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Label29 />
      <DefaultPromptConfiguration />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1200 1">
            <line id="Line 222" stroke="var(--stroke-0, #ACACAC)" x2="1200" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Label33 />
      <DefaultPromptConfiguration1 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1200 1">
            <line id="Line 222" stroke="var(--stroke-0, #ACACAC)" x2="1200" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Label39 />
      <InitialInformations4 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1200 1">
            <line id="Line 222" stroke="var(--stroke-0, #ACACAC)" x2="1200" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Label48 />
      <Frame12 />
    </div>
  );
}

function InnerFrame() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative w-full" data-name="Inner Frame">
      <Header />
      <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[10px] w-full" data-name="Inside Container">
        <div className="overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex flex-col gap-[10px] items-start p-[10px] relative size-full">
            <Header1 />
            <div className="h-0 relative shrink-0 w-full">
              <div className="absolute inset-[-1px_0_0_0]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1200 1">
                  <line id="Line 222" stroke="var(--stroke-0, #ACACAC)" x2="1200" y1="0.5" y2="0.5" />
                </svg>
              </div>
            </div>
            <Content />
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-[#afaeae] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
    </div>
  );
}

export default function DocumentTemplatesManagement() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start p-[20px] relative size-full" data-name="Document Templates Management">
      <InnerFrame />
    </div>
  );
}