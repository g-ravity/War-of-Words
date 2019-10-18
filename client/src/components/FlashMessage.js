import React from "react";

const FlashMessage = () => {
  return (
    <div id="flash_message">
      <h2 id="flash_header" style="margin-bottom: 10px"></h2>
      <p id="flash_content">{error_msg}</p>
    </div>
  );
};

export default FlashMessage;
