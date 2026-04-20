import React, { useEffect, useState } from "react";
import {
  TextInput,
  Button,
  Group,
  Paper,
  Divider,
  Input,
  Grid,
  Autocomplete,
} from "@mantine/core";
import { DownloadSimple } from "@phosphor-icons/react";
import axios from "axios";
import NavCom from "../NavCom";
import ManageStock from "./ManageStocksNav";
import CustomBreadcrumbs from "../../components/common/Breadcrumbs";
import { compounderRoute } from "../../../../routes/health_center";

function AddStock() {
  const [brand, setBrand] = useState("");
  const [brandnames, setbrandnames] = useState([]);
  const [similar, setsimilar] = useState([]);
  const [manuname, setmanu] = useState("");
  const [constit, setConstit] = useState("");
  const [medname, setmedname] = useState("");
  const [packsize, setpack] = useState("");
  const [Quantity, setquantity] = useState(0);
  const [Supplier, setsupplier] = useState("");
  const [date, setdate] = useState("");
  const [Selected, setSelected] = useState(-1);
  const [submit, setSubmit] = useState(false);
  const [reportfile, setFile] = useState(null);

  const applySelectedMedicine = (item) => {
    if (!item) {
      setSelected(-1);
      setmanu("");
      setpack("");
      setConstit("");
      setmedname("");
      return;
    }

    setSelected(item.id);
    setmanu(item.manufacturer_name || "");
    setpack(item.pack_size_label || "");
    setConstit(item.constituents || "");
    setmedname(item.medicine_name || "");
  };

  const getErrorMessage = (payload, fallback) => {
    if (!payload) {
      return fallback;
    }
    if (typeof payload.detail === "string" && payload.detail.trim() !== "") {
      return payload.detail;
    }
    if (payload.errors && typeof payload.errors === "object") {
      const firstKey = Object.keys(payload.errors)[0];
      const firstValue = payload.errors[firstKey];
      if (Array.isArray(firstValue) && firstValue.length > 0) {
        return String(firstValue[0]);
      }
      if (typeof firstValue === "string") {
        return firstValue;
      }
    }
    return fallback;
  };

  const fetchMedicine = async (searchText = "") => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        compounderRoute,
        {
          medicine_name_for_stock: searchText,
          get_stock: 1,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      console.log(response);
      const rows = Array.isArray(response?.data?.sim) ? response.data.sim : [];
      const uniqueBrandNames = [
        ...new Set(rows.map((value) => value.brand_name).filter(Boolean)),
      ];
      setsimilar(rows);
      setbrandnames(uniqueBrandNames);
    } catch (err) {
      console.log(err);
    }
  };

  const handlebrand = (event) => {
    console.log(event);
    setBrand(event);
    const selectedItem = similar.find(
      (item) =>
        (item.brand_name || "").toLowerCase() === (event || "").toLowerCase(),
    );

    applySelectedMedicine(selectedItem || null);
    fetchMedicine(event);
  };

  useEffect(() => {
    fetchMedicine("");
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log("CHANGE");
    console.log(reportfile);
  };

  useEffect(() => {
    if (reportfile) {
      console.log("State Updated:", reportfile);
    }
  }, [reportfile]);

  const handleUpload = async () => {
    if (!reportfile) return;
    const token = localStorage.getItem("authToken");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result.split(",")[1];

      try {
        const response = await axios.post(
          compounderRoute,
          {
            add_stock_excel: 1,
            file_data: base64Data,
            filename: reportfile.name,
          },
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );
        console.log(response.data);

        if (response?.data?.status === 1) {
          const created = Number(response?.data?.created || 0);
          alert(`Stock uploaded successfully. Rows added: ${created}`);
          setFile(null);
          return;
        }

        alert(
          getErrorMessage(
            response?.data,
            "Excel upload failed. Please check column names and values.",
          ),
        );
      } catch (err) {
        console.log(err);
        alert(getErrorMessage(err?.response?.data, "Excel upload failed."));
      }
    };

    reader.readAsDataURL(reportfile);
  };

  const handelgetfile = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        compounderRoute,
        { get_file: 1, file_id: -2 },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
          responseType: "blob",
        },
      );
      const blob = response.data;
      const fileURL = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = "example_add_stock.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.log(err);
      alert(
        getErrorMessage(
          err?.response?.data,
          "Unable to download stock template.",
        ),
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmit(true);
    const token = localStorage.getItem("authToken");
    if (Selected !== -1) {
      try {
        const response = await axios.post(
          compounderRoute,
          {
            medicine_id: Selected,
            quantity: Quantity,
            supplier: Supplier,
            expiry_date: date,
            add_stock: 1,
          },
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );
        console.log(response);
        if (response?.data?.status === 1) {
          alert("Added Stock");
          setquantity(0);
          setsupplier("");
          setdate("");
          return;
        }

        alert(getErrorMessage(response?.data, "Unable to add stock."));
      } catch (err) {
        console.log(err);
        alert(getErrorMessage(err?.response?.data, "Unable to add stock."));
      } finally {
        setSubmit(false);
      }
      return;
    }

    setSubmit(false);
    alert("Please select a medicine from suggestions before submitting stock.");
  };
  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <ManageStock />
      <br />
      <Paper shadow="xl" p="xl" withBorder>
        <div
          style={{
            textAlign: "center",
            fontSize: "1.8rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "#15abff",
          }}
        >
          Insert Data using Excel File
        </div>

        <Group position="center" mt="lg">
          <Input
            type="file"
            label="add stock using excel"
            id="report"
            placeholder="Choose File"
            mb="lg"
            accept=".xlsx"
            style={{ width: "30%" }}
            onChange={handleFileChange}
          />
          <Button
            onClick={handleUpload}
            style={{ backgroundColor: "#15ABFF", color: "white" }}
          >
            Submit
          </Button>
          <Button
            variant="outline"
            leftIcon={<DownloadSimple size={20} />}
            style={{
              borderColor: "#15ABFF",
              color: "#15ABFF",
            }}
            onClick={handelgetfile}
          >
            Download Example
          </Button>
        </Group>

        <Divider my="lg" label="OR" labelPosition="center" />

        <Grid gutter="sm">
          <Grid.Col span={6}>
            <Autocomplete
              label="Brand Name"
              id="brand-name"
              placeholder="Brand Name"
              value={brand}
              onChange={handlebrand}
              data={brandnames}
              onFocus={() => fetchMedicine(brand)}
              nothingFoundMessage="No matching medicine found"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Quantity"
              id="quantity"
              placeholder="Quantity"
              value={Quantity}
              onChange={(e) => {
                setquantity(e.target.value);
              }}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Supplier"
              id="supplier"
              placeholder="Supplier"
              value={Supplier}
              onChange={(e) => {
                setsupplier(e.target.value);
              }}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Expiry Date"
              id="expiry-date"
              type="date"
              value={date}
              onChange={(e) => {
                setdate(e.target.value);
              }}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Medicine Name"
              id="medicine-name"
              placeholder="Medicine Name"
              value={medname}
              onChange={(e) => {
                setmedname(e.target.value);
              }}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Constituents"
              id="constituents"
              placeholder="Constituents"
              value={constit}
              onChange={(e) => {
                setConstit(e.target.value);
              }}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Manufacturer Name"
              id="manufacturer-name"
              placeholder="Manufacturer Name"
              value={manuname}
              onChange={(e) => {
                setmanu(e.target.value);
              }}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Pack Size Label"
              id="pack-size"
              placeholder="Pack Size"
              value={packsize}
              onChange={(e) => {
                setpack(e.target.value);
              }}
            />
          </Grid.Col>
        </Grid>

        <Group position="center" mt="lg">
          <Button
            type="submit"
            style={{
              backgroundColor: "#15ABFF",
              margin: "auto",
              display: "block",
            }}
            onClick={handleSubmit}
          >
            {submit ? "Submitting..." : "Submit"}
          </Button>
        </Group>
      </Paper>
    </>
  );
}

export default AddStock;
