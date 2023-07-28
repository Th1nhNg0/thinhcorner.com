"use client";
import { Anchor, Box, Image, Text, Timeline, Title } from "@mantine/core";
import { format } from "date-fns";
import { Metadata } from "next";

import { BsFillRocketTakeoffFill } from "react-icons/bs";
import { GoBook } from "react-icons/go";
import { MdOutlineScience } from "react-icons/md";
import { PiBaby, PiGuitarLight, PiMedal } from "react-icons/pi";
import { SlGraduation } from "react-icons/sl";

export const metadata: Metadata = {
  title: "Timeline - Thịnh's Corner",
};

export default function page() {
  return (
    <Box>
      <Title mb="lg">My Timeline</Title>
      <Timeline active={3} bulletSize={32} color="cyan">
        <Timeline.Item
          title="Doing right now"
          bullet={<BsFillRocketTakeoffFill />}
        >
          <Text>
            - Learning about Data Science and AI.
            <br />- Research Geographic Information System and ERP System.
          </Text>
        </Timeline.Item>
        <Timeline.Item
          title="First research paper published"
          bullet={<MdOutlineScience />}
        >
          <Text component="time" size="sm" dateTime="2023-07-18">
            {format(new Date(2023, 6, 18), "dd/MM/yyy")}
          </Text>
          <Text>
            Intelligent Retrieval System on Legal Information - 15th Asian
            Conference on Intelligent Information and Database Systems
          </Text>
        </Timeline.Item>
        <Timeline.Item
          title="Won first prize in WebDev Adventure 2022"
          bullet={<PiMedal />}
        >
          <Text component="time" size="sm" dateTime="2022-05-13">
            {format(new Date(2022, 4, 13), "dd/MM/yyy")}
          </Text>
          <Text>
            <Anchor
              target="_blank"
              href="https://github.com/Th1nhNg0/travel_flow_hackathon"
            >
              Link to Project
            </Anchor>
          </Text>
          <Image src="/timelines/webdev2022.jpg" alt="" />
        </Timeline.Item>
        <Timeline.Item
          title="Start studying at University of Science, Vietnam National University Ho Chi Minh City"
          bullet={<GoBook />}
        >
          <Text component="time" size="sm" dateTime="2019-08-15">
            {format(new Date(2019, 7, 15), "dd/MM/yyy")}
          </Text>
          <Image src="/timelines/hcmus.jpg" alt="" />
        </Timeline.Item>
        <Timeline.Item
          title="Graduate from Phan Ngoc Hien High School for the Gifted"
          bullet={<SlGraduation />}
        >
          <Text component="time" size="sm" dateTime="2019-05-21">
            {format(new Date(2019, 4, 21), "dd/MM/yyy")}
          </Text>
        </Timeline.Item>
        <Timeline.Item
          title="Won the Consolation prize at the national competition for excellent students in high school"
          bullet={<PiMedal />}
        >
          <Text component="time" size="sm" dateTime="2019-04-21">
            {format(new Date(2019, 1, 21), "dd/MM/yyy")}
          </Text>
          <Image src="/timelines/hsgqg.jpg" alt="" />
        </Timeline.Item>
        <Timeline.Item
          title="Won the First prize at the provincial competition for excellent students in high school"
          bullet={<PiMedal />}
        >
          <Text component="time" size="sm" dateTime="2017-10-11">
            {format(new Date(2017, 9, 11), "dd/MM/yyy")}
          </Text>
        </Timeline.Item>
        <Timeline.Item
          title="Won Silver medal at olympic competition 30/4 XXIII"
          bullet={<PiMedal />}
        >
          <Text component="time" size="sm" dateTime="2017-04-16">
            {format(new Date(2017, 3, 16), "dd/MM/yyy")}
          </Text>
          <Image src="/timelines/olp.jpg" alt="" />
        </Timeline.Item>
        <Timeline.Item
          title="Start studying at Phan Ngoc Hien High School for the Gifted"
          bullet={<GoBook />}
        >
          <Text component="time" size="sm" dateTime="2016-09-10">
            {format(new Date(2016, 8, 10), "dd/MM/yyy")}
          </Text>
          <Image src="/timelines/cpnh.jpg" alt="" />
        </Timeline.Item>
        <Timeline.Item
          title="Graduate from Vo Thi Sau Secondary School"
          bullet={<SlGraduation />}
          lineVariant="dashed"
        >
          <Text component="time" size="sm" dateTime="2016-07-15">
            {format(new Date(2016, 6, 15), "dd/MM/yyy")}
          </Text>
        </Timeline.Item>

        <Timeline.Item
          title="Learning to play guitar"
          bullet={<PiGuitarLight />}
          lineVariant="dashed"
        >
          <Text component="time" size="sm" dateTime="2012">
            2012
          </Text>
        </Timeline.Item>

        <Timeline.Item
          title="Start studying at Vo Thi Sau Secondary School"
          bullet={<GoBook />}
          lineVariant="dashed"
        >
          <Text component="time" size="sm" dateTime="2012">
            2012
          </Text>
          <Image src="/timelines/vts.jpg" alt="" />
        </Timeline.Item>

        <Timeline.Item title="Born in Ca Mau City, Vietnam" bullet={<PiBaby />}>
          <Text component="time" size="sm" dateTime="2001-09-08">
            {format(new Date(2001, 8, 8), "dd/MM/yyy")}
          </Text>
        </Timeline.Item>
      </Timeline>
    </Box>
  );
}
