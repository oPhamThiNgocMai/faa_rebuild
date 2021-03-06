import React from 'react';
import ReactOnRails from 'react-on-rails';
import axios from 'axios';
import {Redirect} from 'react-router-dom';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import {defaultMessages} from '../../../../libs/i18n/default';
import Errors from '../Errors';
import {handleInput} from '../../utils/InputHandle';
import {Checkbox, CheckboxGroup} from 'react-checkbox-group';
import SimpleMDE from 'react-simplemde-editor';

const csrfToken = ReactOnRails.authenticityToken();

class NewUser extends React.Component {
  constructor(props, _railsContext) {
    super(props);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);

    this.state = {
      name: "",
      role: "",
      quote: "",
      email: "",
      phone: "",
      office: "",
      submitSuccess: false,
      url: "",
      errors: [],
      roles: [],
      certifications: [],
      userCertifications: [],
      introduction: ""
    }
  }

  introductionChangeHandle(value) {
    this.setState({introduction: value});
  }

  handleFileChange(e) {
    const reader = new FileReader();
    const file = e.currentTarget.files[0];
    const that = this;

    reader.onloadend = function() {
      that.setState({url: reader.result});
    }

    if (file) {
      reader.readAsDataURL(file);
    } else {
      this.setState({url: ""});
    }
  }

  componentDidMount() {
    $.getJSON('/v1/users/new.json', (response) => {
      this.setState({ roles: response.content.roles, certifications: response.content.certifications});
    });
  }

  userCertificationsChanged = (newCertifications) => {
    this.setState({
      userCertifications: newCertifications
    });
  }

  handleFormSubmit(e) {
    const {formatMessage} = this.props.intl;

    e.preventDefault();
    let id = this.props.match.params.id;
    const {name, role, quote, email, phone, office, url, userCertifications, introduction} = this.state;
    let formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("quote", quote);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("office", office);
    formData.append("introduction", introduction);

    formData.append("image_attributes[url]", url);

    userCertifications.map((certification, index) => {
      formData.append('user_certifications_attributes['+ index +'][certification_id]', certification );
    })

    axios.post(`/v1/users.json`,
      formData,
      {
        headers: {'X-CSRF-Token': csrfToken},
        responseType: 'json'
      })
      .then((response) => {
        const {status, message, content} = response.data;
        if(status === 200) {
          this.setState({submitSuccess: true});
          $.growl.notice({message: formatMessage(defaultMessages.adminUsersAddSuccess)});
        } else {
          this.setState({errors: content});
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    const {formatMessage} = this.props.intl;

    if(this.state.submitSuccess) {
      return (
        <Redirect to="/admin/users/">
        </Redirect>
      );
    } else {
      return (
        <div className="row">
          <div className="form-group col-md-7 col-md-offset-2 col-sm-6">
            {
              this.state.url && (
                <div className="col-md-1">
                  <img className="preview-image" src={this.state.url}/>
                </div>
              )
            }
          </div>
          <div className="col-md-7 col-md-offset-2">
            {
              this.state.errors.length > 0 && <Errors errors={this.state.errors}/>
            }
            <form role="form" onSubmit={this.handleFormSubmit} id="edit-user-form">
              <input type="hidden" ref="authenticity_token" value={csrfToken}/>
              <div className="form-group">
                <input type="file" ref="image_attributes_url" name="image_attributes_url"
                  onChange={this.handleFileChange}></input>
              </div>
              <div className="form-group">
                <label className="control-label">
                  {formatMessage(defaultMessages.adminUsersCertifications)}
                </label>
                <CheckboxGroup
                  name="userCertifications"
                  value={this.state.userCertifications}
                  onChange={this.userCertificationsChanged}>
                  {
                    this.state.certifications.map(function(certification) {
                      return <label className="mg-rg-10" key={certification.id} ><Checkbox className="mg-custom mg-rg-5" value={certification.id}/>{certification.name}</label>
                    })
                  }
                </CheckboxGroup>
              </div>
              <div className="form-group">
                <label className="control-label">
                  {formatMessage(defaultMessages.adminUsersName)}
                </label>
                <input ref="name" name="name" type="text" className="form-control"
                  value={this.state.name} onChange={handleInput.bind(this)}
                  required="required"/>
              </div>
              <div className="form-group">
                <label className="control-label">
                  {formatMessage(defaultMessages.adminUsersRole)}
                </label>
                <select onChange={handleInput.bind(this)} ref="role" defaultValue="" name="role" className="form-control" required>
                  <option value={this.state.role} disabled>Role</option>
                  {
                    this.state.roles.map(function(role) {
                      return <option key={role}
                        value={role}>{role}</option>;
                    })
                  }
                </select>
              </div>

              <div className="form-group">
                <label className="control-label">
                  {formatMessage(defaultMessages.adminUsersQuote)}
                </label>
                <textarea form="edit-user-form" rows="5" ref="quote"
                  name="quote" type="text" className="form-control"
                  value={this.state.quote} onChange={handleInput.bind(this)}/>
              </div>

              <div className="form-group">
                <label className="control-label">
                  {formatMessage(defaultMessages.adminUsersEmail)}
                </label>
                <input ref="email" name="email" type="text" className="form-control"
                  value={this.state.email} onChange={handleInput.bind(this)}
                  required="required"/>
              </div>

              <div className="form-group">
                <label className="control-label">
                  {formatMessage(defaultMessages.adminUsersPhone)}
                </label>
                <input ref="phone" name="phone" type="text" className="form-control"
                  value={this.state.phone} onChange={handleInput.bind(this)}
                  required="required"/>
              </div>

              <div className="form-group">
                <label className="control-label">
                  {formatMessage(defaultMessages.adminUsersOffice)}
                </label>
                <input ref="office" name="office" type="text" className="form-control"
                  value={this.state.office} onChange={handleInput.bind(this)}/>
              </div>

              <div className="form-group">
                <label className="control-label">
                  {formatMessage(defaultMessages.adminUsersIntroduction)}
                </label>
                <SimpleMDE value={this.state.introduction} options={{spellChecker: false}}
                  onChange={this.introductionChangeHandle.bind(this)}/>
              </div>

              <input type="hidden" ref="authenticity_token" value={csrfToken}/>
              <div className="form-group submit-group">
                <button type="submit" className="btn btn-primary">
                  {formatMessage(defaultMessages.adminUsersSave)}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }
  }
}

export default injectIntl(NewUser);
