import React from 'react'
import { Progress } from 'antd';
function ProgressBar({pc}) {
  return (
    <Progress percent={pc} />
  )
}

export default ProgressBar