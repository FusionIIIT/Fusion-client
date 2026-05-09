import { Button, Paper, Textarea, Title } from "@mantine/core";
import { useState } from "react";
import NavCom from "../NavCom";
import AnnounceNavBar from "./announPath";
import CustomBreadcrumbs from "../../components/common/Breadcrumbs";
import { createAnnouncementApi } from "../../services/api";

function CompAnnounements() {
  const [announce, setAnnounce] = useState("");

  const make_announcement = async () => {
    try {
      await createAnnouncementApi({ message: announce });
      alert("announcement published");
      setAnnounce("");
    } catch (err) {
      console.log(err);
    }
  };

  const handletextAnnounc = (event) => {
    setAnnounce(event.target.value);
  };

  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <AnnounceNavBar style={{ display: "flex" }} />
      <br />

      <Paper shadow="xl" p="xl" withBorder>
        <Title
          order={3}
          style={{
            color: "#15abff",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Make a new Announcement
        </Title>

        <div>
          <Textarea
            value={announce}
            onChange={handletextAnnounc}
            label="Announcement Details"
            placeholder="What is the Announcement?"
          />
        </div>

        <br />
        <Button
          style={{
            backgroundColor: "#15abff",
            color: "white",
            padding: "10px 30px",
            border: "none",
            margin: "auto",
            display: "block",
          }}
          onClick={make_announcement}
        >
          Publish
        </Button>
      </Paper>
    </>
  );
}

export default CompAnnounements;
