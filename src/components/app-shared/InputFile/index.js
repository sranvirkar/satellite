import React, { Component } from "react";
import jsforce from 'jsforce';
import LoadingSpinner from "components/app-global/LoadingSpinner";
import Modal from "components/app-global/Modal";
import { Trash, CircleTick } from "helpers/svgIcons";

const initialState = {
  selectedFiles: [],
  fileUploading: false,
  uploaded: false
}
class InputFile extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;

  }
  getBase64 = (file)  => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onerror = () => {
        reader.abort();
        reject(console.error('Problem uploading File'));
      }
      reader.onloadend = () => {
        let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
        if ((encoded.length % 4) > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve({
          uri: reader.result,
          base64StringFile: encoded,
          fileName: this.getFileName(file),
          fileType: file.type
        });
      };
    });
  }

  handleChange = async event => {
    // const { field, answer, repeatableIndex } = this.props;
    if (!event.target || !event.target.files) {
      return;
    }
    const file = event.target;
    
    for (var i = 0; i < file.files.length; i++) {
     
      let singleFile = file.files[i];
      try {
       await this.getBase64(singleFile).then((constructedFile) => {
          this.setState({
            selectedFiles: [...this.state.selectedFiles, {constructedFile}],
           });
        });
      } catch (e) {
          console.log(e);
      }
    }
  }
  uploadFile = () => {
    
    if(this.state.selectedFiles && this.state.selectedFiles.length) {
      var conn = new jsforce.Connection({
        serverUrl : siteUrl,
        sessionId : sessionId
      });
      this.state.selectedFiles.forEach((fileToUpload) => {
        this.setState({
          fileUploading: !this.state.fileUploading
         });
        conn.sobject('Attachment').create({ 
             ParentId: userModel.contactId,
             Name : fileToUpload.constructedFile.fileName,
             Body: fileToUpload.constructedFile.base64StringFile,
             ContentType : fileToUpload.constructedFile.fileType,  
         }).then( (response) => {
           if(response.success === true) {
            this.setState({
              fileUploading: false,
              uploaded: true
            })
           }
          
         });
        });
      }
    }

  getFileName = (file) =>  {
    var extIndex = file.name.lastIndexOf( '.' );
    var extension = file.name.substring( extIndex );
    var fileName = file.name.substring( 0, extIndex );
        fileName = fileName.replace( /\./g, '_' );
        fileName += extension;
        
    return fileName;
  }

  handleDelete = (fileToDelete) => {
    this.setState((prevState) => ({
      selectedFiles: prevState.selectedFiles.filter(file => file.constructedFile.fileName !== fileToDelete)
    }));
  }

  handleBlur = (event) => {
    this.props.onBlurValidation(event.target.value);
  }
  resetState = () => {
    this.setState(initialState);
  }

  render() {
    const { field, answer, repeatableIndex } = this.props;
    const images = this.state.selectedFiles.map((file, key) =>
    <p className ={key}> 
      <i className="material-icons">file_copy</i> 
        {file.constructedFile.fileName}  
        {/* is there a better way of doing this without creating a new function every time / creating a new component?  */}
          <span onClick={ () => {this.handleDelete(file.constructedFile.fileName)}}> 
            <Trash/>
          </span>
     </p> 
    );

    return (
      <div className="container">
      
      {
          !this.state.uploaded &&
          <div>
          <div className={`${answer.validationErrors && answer.validationErrors.length > 0 ? "error " : ""}${answer.value ? "answer " : ""}shared-InputFile`}>
          {
            this.state.fileUploading && 
            <div className="loading-overlay">
              <LoadingSpinner width={50} />
            </div>
          }
          <input
            id={repeatableIndex !== undefined ? `${field.name}-${repeatableIndex}` : field.name}
            type="file"
            accept={`${field.values.map(v => v + ', ')}`}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            {...answer.disabled ? { disabled: true } : undefined }
            multiple />

          <label
            tabIndex="0"
            htmlFor={repeatableIndex !== undefined ? `${field.name}-${repeatableIndex}` : field.name}> Browse <br/><span className="poncho-caption-grey filetype"> File types: PDF, JPG, PNG.</span> </label>
        </div>
              <div className="photo-container">
                {images}
              </div>
              <div className="buttonContainer">
                <button className="attachfileButton poncho-btn-primary-reg" onClick={this.uploadFile}>Upload Files</button>
              </div>
          </div>
        }
        
        {
        this.state.uploaded &&
        <div className="confirmUpload">
            <CircleTick className="green-circle-tick" color="#68B34F" size="32" />
            <p className="confirmationMessage poncho-body">File(s) Successfully Uploaded!</p>
            <p className="poncho-body"> <a onClick ={this.resetState}> More files to upload?</a> </p>
        </div>
        }
       
      </div>
    );
  }
}

export default InputFile;
