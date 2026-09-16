import React, {useEffect, useMemo, useState} from "react";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import Head from "next/head";
import PaymentLogic from "@/lib/payment/PaymentLogic";
import CreditSection from "@/components/common/settings/auth/signed-in/CreditSection";

function Purchase() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  const paymentLogic = useMemo(() => new PaymentLogic(), []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await paymentLogic.fetchProducts();
        setProducts(data);
      } catch (err) {
        setAlertMessage(err.message);
        setAlertSeverity('error');
        setAlertOpen(true);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [paymentLogic]);

  const handlePurchase = async (productId) => {
    setPurchasing(productId);

    try {
      const checkoutUrl = await paymentLogic.createCheckout(productId);
      window.location.href = checkoutUrl;
    } catch (err) {
      setAlertMessage(err.message);
      setAlertSeverity('error');
      setAlertOpen(true);
      setPurchasing(null);
    }
  };

  return (
    <div className="local-scroll-container">
      <Head>
        <title>Purchase Credit</title>
      </Head>
      <div className="local-scroll-scrollable flex-center">
        <Paper elevation={4} className="p-6">
          <Typography variant="h5" gutterBottom>
            Purchase Credit
          </Typography>

          <CreditSection/>

          {loadingProducts ? (
            <div className="text-center mt-4">
              <CircularProgress/>
            </div>
          ) : (
            <div className="flex-center gap-4 mt-4">
              {products.map((product) => (
                <Card key={product.id} sx={{minWidth: 140}}>
                  <CardContent>
                    <Typography variant="h6">${product.credit}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.credit} Credits
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={purchasing !== null}
                      onClick={() => handlePurchase(product.id)}
                    >
                      {purchasing === product.id ? (
                        <CircularProgress size={24}/>
                      ) : (
                        "Buy"
                      )}
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </div>
          )}
        </Paper>
      </div>

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{width: '100%'}}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Purchase;
