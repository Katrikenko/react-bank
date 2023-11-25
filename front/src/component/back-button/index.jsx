import React from "react"
import "./index.css"

class BackButton {
	static back() {
		return window.history.back()
	}
}

window.backButton = BackButton


function Back() {
	const handleBackClick = () => {
		window.backButton.back()
	}
	return (
		<div className="back-button" onClick={handleBackClick}>
			<img src="/svg/back-button.svg" alt="<" height={"24px"} width={"24px"}/>
		</div>
	)
}

export default Back;