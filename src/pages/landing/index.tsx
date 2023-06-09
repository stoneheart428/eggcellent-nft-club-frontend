import React, { useState, useEffect } from "react";
import {
  LandingPageWrapper,
  CountBtn,
  MintContainer,
  MintContent,
  MintForm,
  MintFrom,
  MintInput,
} from "./styles";

import { AppLayout } from "../../layouts/AppLayout";
import {
  ContactSection,
  GitBookSection,
  RoadMapSection,
  TeamSection,
  TextTypingAnimation,
} from "../../modules";

import { GitbookButton } from "../../modules/gitbook/styles";
import { useEthContext } from "../../context/EthereumContext";
import { Contract } from "ethers";
import {
  EggHub_Abi,
  EggHub_Address,
  USDT_Abi,
  USDT_Address,
} from "../../contract/contract";

import { toast } from "react-toastify";

import ReactLoading from "react-loading";

export const Landing: React.FC = () => {
  const { currentAcc, provider } = useEthContext();
  const [num, setNum] = useState(0);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [sale, setSale] = useState(0);
  const onIncrease = () => {
    if (num < 100) setNum(num + 1);
  };
  const onDecrease = () => {
    if (num >= 1) setNum(num - 1);
  };

  useEffect(() => {
    reset();
    if (provider) {
      try {
        (async () => {
          const contract = new Contract(
            EggHub_Address,
            EggHub_Abi,
            provider.getSigner()
          );
          const res = await contract.getMaxSupply();
          setTotal(res.toString());
        })();
      } catch (error) {}
    }
  }, [provider]);
  useEffect(() => {
    if (provider) {
      try {
        const interval = setInterval(async () => {
          const contract = new Contract(
            EggHub_Address,
            EggHub_Abi,
            provider.getSigner()
          );
          const res = await contract.totalSupply();
          setSale(res.toString());
        }, 2000);

        return () => clearInterval(interval);
      } catch (error) {}
    }
  }, [provider]);

  async function connect() {
    if (num > 0) {
      setLoading(true);
      try {
        const contract = new Contract(
          USDT_Address,
          USDT_Abi,
          provider.getSigner()
        );
        const res = await contract.approve(EggHub_Address, 250 * Number(num));
        await res.wait();
        const egg_contract = new Contract(
          EggHub_Address,
          EggHub_Abi,
          provider.getSigner()
        );
        const tx = await egg_contract.mintUSDT(num);
        await tx.wait();
        await toast.success("Successfully Minted.", { theme: "dark" });
        await reset();
        await setLoading(false);
      } catch (error) {
        await setLoading(false);
      }
    } else {
      toast.error("Enter Count", { theme: "dark" });
    }
  }
  const reset = () => {
    setNum(0);
  };
  return (
    <AppLayout>
      <LandingPageWrapper id="home">
        <h1 id="home-title">
          <b>EGGCELLENT NFT CLUB</b>
          <br />
          <span>Chicken Eggs Farming</span>
          <TextTypingAnimation
            className="block"
            key="line-1"
            texts={["Backed by Real-World Poultry Farm in Malaysia"]}
          />
        </h1>
        {currentAcc && (
          <MintFrom>
            <MintContent>
              <img src="/assets/images/reveal.png" className="chicken" alt="" />
            </MintContent>
            <MintContainer>
              <MintForm>
                <MintInput type="number" value={num} readOnly />
                <div>
                  <CountBtn
                    style={{ borderRadius: "0 10px 0 0" }}
                    onClick={onIncrease}
                  >
                    +
                  </CountBtn>
                  <CountBtn
                    style={{ borderRadius: "0 0 10px 0" }}
                    onClick={onDecrease}
                  >
                    -
                  </CountBtn>
                </div>
              </MintForm>
              <span>
                {sale}/{total}
              </span>

              <GitbookButton
                className="check"
                onClick={() => !loading && connect()}
                style={{ borderRadius: "15px", width: "100px" }}
              >
                {currentAcc ? (
                  loading ? (
                    <ReactLoading
                      type={"spokes"}
                      color={"#8459ff"}
                      height={"30px"}
                      width={"30px"}
                    />
                  ) : (
                    `Mint`
                  )
                ) : (
                  "Connect Wallet"
                )}
              </GitbookButton>
            </MintContainer>
          </MintFrom>
        )}
      </LandingPageWrapper>

      <GitBookSection />
      <RoadMapSection />
      <TeamSection />
      <ContactSection />
    </AppLayout>
  );
};
