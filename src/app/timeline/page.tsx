import { RoundedImageRaw } from "@/components/mdx-client";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Timeline",
  description: "My timeline.",
};

export default function AboutView() {
  return (
    <div>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        my timeline
      </h1>
      <ol className="relative ml-3 space-y-10 border-l-2 border-gray-100 dark:border-[#211C1C]">
        <Item
          title="Start learning Master of Business Administration at UEH University of Economics Ho Chi Minh City"
          icon="🏫"
          time="2024-10-01"
        ></Item>
        <Item
          title="Graduated from University of Science, Vietnam National University Ho Chi Minh City"
          icon="🎓"
          time="2023-11-25"
        ></Item>
        <Item
          title="Finished my graduation thesis at University of Science, Vietnam National University Ho Chi Minh City"
          icon="📜"
          time="2023-07-16"
        >
          <a
            href="/timeline/thesis.pdf"
            className="text-blue-500 hover:underline"
          >
            Deep learning in legal system: Opportunities and Challenges
          </a>
        </Item>

        <Item
          title="First research paper published"
          icon="📜"
          time="2023-07-18"
        >
          <a
            href="https://doi.org/10.1007/978-981-99-5834-4_8"
            className="text-blue-500 hover:underline"
          >
            Intelligent Retrieval System on Legal Information
          </a>
        </Item>

        <Item
          title="Won first prize in WebDev Adventure 2022"
          icon="🥇"
          time="2022-05-13"
        >
          <a
            className="text-blue-500 hover:underline"
            href="https://github.com/Th1nhNg0/travel_flow_hackathon"
          >
            Link to Project
          </a>
          <picture>
            <RoundedImageRaw src="/timeline/webdev2022.jpg" alt="" />
          </picture>
        </Item>
        <Item
          title="Start working at KING ATTORNEY JOINT STOCK COMPANY"
          icon="🏢"
          time="2021-01-01"
        ></Item>

        <Item
          title="Start studying at University of Science, Vietnam National University Ho Chi Minh City"
          icon="🏫"
          time="2019-08-15"
        >
          <picture>
            <RoundedImageRaw src="/timeline/hcmus.jpg" alt="" />
          </picture>
        </Item>

        <Item
          title="Graduated from Phan Ngoc Hien High School for the Gifted"
          icon="🎓"
          time="2019-05-21"
        />
        <Item
          title="Won the Consolation prize at the national competition for excellent students in high school"
          icon="🏅"
          time="2019-04-21"
        >
          <RoundedImageRaw src="/timeline/hsgqg.jpg" alt="" />
        </Item>
        <Item
          title="Won the First prize at the provincial competition for excellent students in high school"
          icon="🥇"
          time="2017-10-11"
        />

        <Item
          title="Won Silver medal at olympic competition 30/4 XXIII"
          icon="🥈"
          time="2017-04-16"
        >
          <RoundedImageRaw src="/timeline/olp.jpg" alt="" />
        </Item>
        <Item
          title="Start studying at Phan Ngoc Hien High School for the Gifted"
          icon="🏫"
          time="2016-09-10"
        >
          <RoundedImageRaw src="/timeline/cpnh.jpg" alt="" />
        </Item>
        <Item
          title="Graduated from Vo Thi Sau Secondary School"
          icon="🎓"
          time="2016-07-15"
        />
        <Item title="Learning to play guitar" icon="🎸" time="2012" />
        <Item
          title="Start studying at Vo Thi Sau Secondary School"
          icon="🏫"
          time="2012"
        >
          <RoundedImageRaw src="/timeline/vts.jpg" alt="" />
        </Item>
        <Item
          title="Born in Ca Mau City, Vietnam"
          icon="👶"
          time="2001-09-08"
        />
      </ol>
    </div>
  );
}

function Item({
  title,
  children,
  icon,
  time = new Date().toISOString(),
}: {
  title: string;
  children?: React.ReactNode;
  icon: string;
  time?: string;
}) {
  return (
    <li className="ml-6">
      <span className="absolute -ml-px text-2xl bg-white dark:bg-[#111010] rounded-full -left-4">
        {icon}
      </span>
      <h2 className="text-neutral-900 dark:text-neutral-100 tracking-tight">
        {title}
      </h2>
      <time
        className="block mb-5 leading-none text-neutral-600 dark:text-neutral-400 text-sm"
        dateTime={time}
      >
        {formatDistanceToNow(new Date(time), {
          addSuffix: true,
        })}
      </time>
      {children}
    </li>
  );
}
