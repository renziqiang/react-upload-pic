import React from 'react';
import { Button, message } from 'antd';
import axios from 'axios';
import 'antd/dist/antd.css';
import PropTypes from 'prop-types';
import './index.css';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      imgSrc: '',
      file: {},
      uploadingProgress: 0,
      uploadStatus: false
    }
  }
  // render(){
  //   return (<div>
  //     123
  //   </div>)
  // }

  handleChoosePic = (e) => {
    const { size, imgHeight, imgWidth, type } = this.props;
    const file = e.target.files[0];
    const img = new Image();
    img.src = window.URL.createObjectURL(file);
    if (type && !this.handleTypeCheck(file.type)) {
      return
    }
    if (size && !this.handleSizeCheck(file.size)) {
      return
    }
    if (imgWidth && imgHeight && !this.handleWidthHeightCheck(img)) {
      return
    }
    this.setState({
      file,
      uploadStatus: false,
      uploadingProgress: 0
    })
    this.handleUpload(file.name)
      .then((res) => {
        this.setState({ imgSrc: res.data.data.src });
        if (!res.data.data.url) {
          setTimeout(() => {
            this.setState({
              uploadStatus: true,
              uploadingProgress: 100
            })
            message.success('图片上传成功');
            if (this.props.callback) {
              this.props.callback(this.state.imgSrc)
            }
          }, 200)
        } else {
          this.handleGetProgress(res.data.data.url)
        }
      })
      .then(() => {
        setTimeout(() => {
          this.setState({ uploadStatus: true })
          message.success('图片上传成功');
          if (this.props.callback) {
            this.props.callback(this.state.imgSrc)
          }
        }, 200)
      })
      .catch(() => {
        message.error('图片上传失败，请重试')
        this.setState({
          imgSrc: '',
          file: {}
        })
      })
  }
  //上传
  handleUpload = (name) => {
    const { url } = this.props;
    const instance = axios.create({
      headers: {
        Authorization: global.window.localStorage.access_token ? `Bearer ${global.window.localStorage.access_token}` : ''
      },
    });
    return instance.get(`${url}?ext=png&filename=${name}&type=image`);
  }

  //获取上传进度
  handleGetProgress = (url) => {
    const uploadInstance = axios.create();
    const config = {
      //  获取上传进度
      onUploadProgress: (progressEvent) => {
        let progress = ((parseInt(progressEvent.loaded) / parseInt(progressEvent.total)) * 100).toFixed(0);
        this.setState({ uploadingProgress: progress });
      },
      headers: {
        'Content-Type': 'image/png',
      },
    };
    return uploadInstance.put(url, this.state.file, config);
  }
  handleTypeCheck = (str) => {
    const { type = 'png,jpg,jpeg,bmp' } = this.props;
    let typeArr = type.split(',');
    typeArr.forEach((item) => {
      if (str.indexOf(item) === -1) {
        message.error(`请上传${type}格式的文件`)
        return false
      }
    })
  }
  handleSizeCheck = (s) => {
    const { size } = this.props;
    if (s / 1024 > size) {
      message.error(`请上传小于${size}K的图片`)
      return false
    }
  }
  handleWidthHeightCheck = (img) => {
    const { imgWidth, imgHeight } = this.props;
    let checked = false;
    if (img.width !== imgWidth && img.height !== imgHeight) {
      message.error(`请上传${imgWidth}px*${imgHeight}px的图片`)
    }
    return checked;
  }
  render() {
    const { imgSrc, uploadingProgress, uploadStatus, file } = this.state;
    const { tip } = this.props;
    return (
      <div>
        <Button type='primary' onClick={() => this.inputPic.click()}>点击</Button>
        <input
          type='file'
          style={{ display: 'none' }}
          ref={(el) => this.inputPic = el}
          onChange={(e) => { this.handleChoosePic(e) }}
        />
        {
          tip && <div className="tip">
            {tip}
          </div>
        }
        <div className='showInfo' style={{ width: '450px', height: '150px', background: '#f5f5f5' }}>
          {
            imgSrc && uploadStatus && <img src={imgSrc} alt='' />
          }
          {
            file.name && !uploadStatus && <div className='uploadInfo'>
              <p>正在上传...</p>
              <div className='progress'>
                <div className='progressContent' style={{ width: `${uploadingProgress}%` }}></div>
              </div>
              <span>{`${uploadingProgress}%`}</span>
            </div>
          }
        </div>
      </div>
    )
  }
}

App.propTypes = {
  url: PropTypes.string.isRequired,
  size: PropTypes.number,
  imgWidth: PropTypes.number,
  imgHeight: PropTypes.number,
  type: PropTypes.string,
  tip: PropTypes.string,
  callback: PropTypes.func,
}
export default App;
