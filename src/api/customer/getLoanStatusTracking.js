// src/api/customer/getLoanStatusTracking.js

import { loanApi5015 } from "../client";  // Adjust if needed

export async function getLoanStatusTracking(loanNumber) {
  try {
    const payload = {
      body: { LoanNumber: loanNumber }
    };

    console.log("📡 Loan Status Payload:", payload);

    const { data } = await loanApi5015.post(
      "/API/GetDetails/GetLoanStatusTracking",
      payload
    );

    console.log("📡 Loan Status Raw Response:", JSON.stringify(data));

    if (data.executionStatus !== "Success") {
      throw new Error(data.executionMessage || "Failed to fetch loan status");
    }

    const raw = data.gridParams?.LoanStatus || {};
    const arr = Object.values(raw);

    // 🔹 Transform & Clean Timeline
    const timeline = arr.map((item) => {
      const title = extractInnerText(item.Comments, "loan_head");
      const rawDate = extractInnerText(item.Comments, "loan_content");
      const rawState = extractInnerText(item.ColumnStatus, "loan_tick");

      const trimmedState = (rawState || "").trim();

      // 🔹 Map backend state → UI state
      let status = "pending";
      if (trimmedState === "1") status = "done";

      return {
        label: title || "-",
        date: rawDate || "-",
        status, // <- derived not hardcoded
      };
    });

    console.log("📌 Cleaned Timeline:", JSON.stringify(timeline));
    return timeline;

  } catch (err) {
    console.log("❌ Loan Status Tracking Error:", err);
    throw err;
  }
}

/** 
 * Extract inner text from:
 * <div class="loan_head">XXX</div>
 * <div class="loan_content">YYY</div>
 * <div class="loan_tick">1</div>
 */
function extractInnerText(html, className) {
  try {
    if (!html) return "-";

    // Handles:
    // <div class=\"loan_head\">
    // <div class=\\"loan_head\\">
    // <div  class = "loan_head" >
    // <div class='loan_head'>
    // multiline inside div
    const regex = new RegExp(
      `<div[^>]*class=\\\\?["']${className}["'][^>]*>([\\s\\S]*?)<\\/div>`,
      "i"
    );

    const match = html.match(regex);

    if (match && match[1]) {
      return match[1].trim();
    }
  } catch (err) {
    console.log("❌ extractInnerText error:", err);
  }

  return "-";
}