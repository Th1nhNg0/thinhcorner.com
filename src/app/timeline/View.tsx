"use client";
import { format } from "date-fns";

export default function AboutView() {
  return (
    <div>
      <h1 className="text-5xl font-bold mb-10">My Timeline</h1>

      <ol className="relative ml-3 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
        <Item title="Doing right now" icon="🚀">
          <p>
            - Learning about Data Science and AI.
            <br />- Research Geographic Information System and ERP System.
          </p>
        </Item>

        <Item
          title="First research paper published"
          icon="📜"
          time="2023-07-18"
        >
          <p>
            Paper: Intelligent Retrieval System on Legal Information - 15th
            Asian Conference on Intelligent Information and Database Systems
          </p>
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
            <img src="/timelines/webdev2022.jpg" alt="" />
          </picture>
        </Item>

        <Item
          title="Start studying at University of Science, Vietnam National University Ho Chi Minh City"
          icon="🏫"
          time="2019-08-15"
        >
          <picture>
            <img src="/timelines/hcmus.jpg" alt="" />
          </picture>
        </Item>

        <Item
          title="Graduate from Phan Ngoc Hien High School for the Gifted"
          icon="🎓"
          time="2019-05-21"
        />
        <Item
          title="Won the Consolation prize at the national competition for excellent students in high school"
          icon="🏅"
          time="2019-04-21"
        >
          <picture>
            <img src="/timelines/hsgqg.jpg" alt="" />
          </picture>
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
          <picture>
            <img src="/timelines/olp.jpg" alt="" />
          </picture>
        </Item>
        <Item
          title="Start studying at Phan Ngoc Hien High School for the Gifted"
          icon="🏫"
          time="2016-09-10"
        >
          <picture>
            <img src="/timelines/cpnh.jpg" alt="" />
          </picture>
        </Item>
        <Item
          title="Graduate from Vo Thi Sau Secondary School"
          icon="🎓"
          time="2016-07-15"
        />
        <Item title="Learning to play guitar" icon="🎸" time="2012" />
        <Item
          title="Start studying at Vo Thi Sau Secondary School"
          icon="🏫"
          time="2012"
        >
          <picture>
            <img src="/timelines/vts.jpg" alt="" />
          </picture>
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
  const is_only_year = time.length === 4;
  return (
    <li className="ml-6">
      <span className="absolute rounded-full -ml-px -left-4 ring-4 ring-white bg-white text-2xl">
        {icon}
      </span>
      <h2 className="mb-1 text-lg font-semibold text-black">{title}</h2>
      <time className="block mb-2 leading-none text-gray-600" dateTime={time}>
        {is_only_year ? time : format(new Date(time), "dd/MM/yyy")}
      </time>
      {children}
    </li>
  );
}
