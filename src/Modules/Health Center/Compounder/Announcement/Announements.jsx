import { Radio, Textarea } from "@mantine/core";
import { NavLink } from "react-router-dom";
import NavCom from "../NavCom";

function CompAnnounements() {
  return (
    <div>
      <NavCom />
      <div style={{ margin: "2rem" }}>
        <div
          style={{
            display: "flex",
            padding: "0.5rem",
            border: "1px solid",
            backgroundColor: "white",
            borderRadius: "9999px",
            width: "22rem",
            gap: "1rem",
          }}
        >
          <NavLink
            to="/compounder/announcement"
            style={{
              textDecoration: "none",
              color: "black",
            }}
          >
            <Radio
              label="Announcements"
              color="grape"
              variant="outline"
              defaultChecked
            />
          </NavLink>

          <NavLink
            to="/compounder/announcement/record"
            style={{
              textDecoration: "none",
              color: "black",
            }}
          >
            <Radio
              label="Announcements Record"
              color="grape"
              variant="outline"
            />
          </NavLink>
        </div>

        <h3>Make a new Announcement</h3>

        <div>
          <p>Announcement Details</p>
          <Textarea
            label="Announcement Details"
            placeholder="What is the Announcement?"
          />
        </div>

        <br />
        <div>
          <p style={{ marginBlock: "1px" }}>Attach Files</p>
          <input
            type="file"
            id="fileUpload"
            style={{
              border: "1px solid black",
              padding: "0.5rem 1rem",
              width: "100%",
            }}
          />
        </div>

        <br />
        <button
          style={{
            backgroundColor: "#6D28D9",
            color: "white",
            padding: "10px 30px",
            border: "none",
          }}
        >
          Publish
        </button>
      </div>
    </div>
  );
}

export default CompAnnounements;
