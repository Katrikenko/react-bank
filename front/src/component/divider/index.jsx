import React from "react"
import "./index.css"



function Divider({className, style}) {

	return (
		<hr className={`divider ${className || ""}`} style={style} />
	)
}

export default Divider;