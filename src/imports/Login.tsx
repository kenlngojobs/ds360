import svgPaths from "./svg-a866f81vzf";
import imgLogo from "figma:asset/2a2c6e1ca3f5c4ba173c8c3bf0d9759ec43064b0.png";

function Ds360Logo() {
  return (
    <div className="absolute inset-[28.13%_27.56%]" data-name="DS360 Logo">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 349.999 349.999">
        <g id="DS360 Logo">
          <path d={svgPaths.p3fe3ae20} fill="var(--fill-0, #5EA7A3)" id="Vector" />
          <path d={svgPaths.p28e53c00} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p11e41700} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p1c544980} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.pd3e3970} fill="var(--fill-0, white)" id="Vector_5" />
          <path d={svgPaths.p2cab6500} fill="var(--fill-0, #5EA7A3)" id="Vector_6" />
          <path d={svgPaths.p9404200} fill="var(--fill-0, white)" id="Vector_7" />
          <path d={svgPaths.p3d3deb00} fill="var(--fill-0, white)" id="Vector_8" />
          <path d={svgPaths.p2a916400} fill="var(--fill-0, white)" id="Vector_9" />
          <path d={svgPaths.p33f53980} fill="var(--fill-0, white)" id="Vector_10" />
          <path d={svgPaths.p1f066000} fill="var(--fill-0, white)" id="Vector_11" />
          <path d={svgPaths.p7474a80} fill="var(--fill-0, #5EA7A3)" id="Vector_12" />
          <path d={svgPaths.p3e910600} fill="var(--fill-0, white)" id="Vector_13" />
          <path d={svgPaths.p28b4f3f0} fill="var(--fill-0, white)" id="Vector_14" />
          <path d={svgPaths.p34f6100} fill="var(--fill-0, white)" id="Vector_15" />
          <path d={svgPaths.p18b91500} fill="var(--fill-0, white)" id="Vector_16" />
          <path d={svgPaths.p23389b00} fill="var(--fill-0, #5EA7A3)" id="Vector_17" />
          <path d={svgPaths.p2e00cd00} fill="var(--fill-0, #5EA7A3)" id="Vector_18" />
        </g>
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-end min-h-px min-w-px pb-[40px] pt-[100px] relative rounded-[25px]" data-name="Logo">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[25px]">
        <div className="absolute bg-black inset-0 rounded-[25px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[25px] size-full" src={imgLogo} />
      </div>
      <p className="font-['Poppins:Regular',sans-serif] h-[50px] leading-[normal] not-italic relative shrink-0 text-[16px] text-center text-white w-[376px] whitespace-pre-wrap">SOLUTIONS FOR ACCOUNT MANAGEMENT (SAM) Copyright All Rights Reserved © 2023</p>
      <Ds360Logo />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[435px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">Email Address</p>
      <div className="bg-white relative rounded-[40px] shrink-0 w-full" data-name="Username">
        <div className="overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex items-start px-[20px] py-[15px] relative w-full">
            <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#3a3a3a] text-[16px]">Enter Email Address</p>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[40px]" />
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute inset-[6.83%_0]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 15.5419">
        <g id="Group">
          <path d={svgPaths.p2325fb00} fill="var(--fill-0, #3A3A3A)" id="Vector" />
          <path d={svgPaths.p25d2bd00} fill="var(--fill-0, #3A3A3A)" id="Vector_2" />
          <path d={svgPaths.p242d0a00} fill="var(--fill-0, #3A3A3A)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-[6.83%_0]" data-name="Group">
      <Group2 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[6.83%_0]" data-name="Group">
      <Group1 />
    </div>
  );
}

function Invisible() {
  return (
    <button className="block cursor-pointer overflow-clip relative shrink-0 size-[18px]" data-name="invisible 1">
      <Group />
    </button>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[435px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">Password</p>
      <div className="bg-white h-[54px] relative rounded-[40px] shrink-0 w-full" data-name="Password - Delayed">
        <div aria-hidden="true" className="absolute border border-[#3a3a3a] border-solid inset-0 pointer-events-none rounded-[40px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[20px] relative size-full">
            <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#3a3a3a] text-[16px] w-[122px] whitespace-pre-wrap">Enter Password</p>
            <Invisible />
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center relative shrink-0 w-full">
      <Frame />
      <Frame1 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[50px] items-center relative shrink-0 w-full">
      <Frame2 />
      <div className="bg-[#46367f] content-stretch flex h-[49px] items-center justify-center px-[80px] py-[12px] relative rounded-[100px] shrink-0 w-[250px]" data-name="Login">
        <div aria-hidden="true" className="absolute border border-[#46367f] border-solid inset-0 pointer-events-none rounded-[100px]" />
        <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">Login</p>
      </div>
    </div>
  );
}

function Form() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center relative shrink-0" data-name="Form">
      <div className="font-['Montserrat:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[0px] text-black text-center w-full whitespace-pre-wrap">
        <p className="mb-0 text-[16px]">Welcome to the</p>
        <p className="font-['Montserrat:Bold',sans-serif] font-bold text-[#4d4085] text-[27px]">DebtSales360 Admin Portal</p>
      </div>
      <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#5b5b5b] text-[16px] text-center w-full whitespace-pre-wrap">Enter your username and password to login to the Admin Portal.</p>
      <Frame3 />
    </div>
  );
}

function InnerFrame() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[50px] h-full items-center justify-center min-h-px min-w-px relative" data-name="Inner Frame">
      <Logo />
      <Form />
    </div>
  );
}

export default function Login() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center p-[50px] relative size-full" data-name="Login">
      <InnerFrame />
    </div>
  );
}