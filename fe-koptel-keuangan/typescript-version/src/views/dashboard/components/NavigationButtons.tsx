import React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { useRouter } from "next/router"; 

const NavigationButtons = () => {
  const router = useRouter(); // Ganti useNavigate dengan useRouter

  return (
    <Grid container spacing={2} sx={{ marginBottom: 4 }}>
      <Grid item xs={12} sm={4}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => router.push("/dashboard/sales/salesinfo")} 
        >
          Telco Super
        </Button>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => router.push("/dashboard/sales/project-financing")}
        >
          Project Financing
        </Button>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => router.push("/dashboard/sales/project-executing")}
        >
          Project Executing
        </Button>
      </Grid>
    </Grid>
  );
};

export default NavigationButtons;