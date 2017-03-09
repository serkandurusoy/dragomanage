import React, { Component } from 'react';
import { Well } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';

export default class Versions extends Component {

  state = {
    activePanel: null,
  }

  handleSelect = (e, activePanel) => {
    e.preventDefault();
    this.setState({
      activePanel : this.state.activePanel === activePanel ? null : activePanel,
    });
  }

  render() {
    const {
      component,
      record,
      versions,
      schema,
      ...props,
    } = this.props;

    return <div>
      <Well bsSize="large" className="lastVersion">
        {
          record._version === 1
            ? <div><FontAwesome name='history' /> Bu kayıt {record.createdBy()} tarafından {record.modifiedAt.toFormattedTime()} tarihinde oluşturuldu.</div>
            : <div><FontAwesome name='history' /> Kayıt {record._version} numaralı bu versiyonuna {record.createdBy()} tarafından {record.modifiedAt.toFormattedTime()} tarihinde güncellendi.</div>
        }
      </Well>
      {
        record._version > 1 &&
        <div className="versions panel-group">
          {
            versions.map((v,ix) =>
              <div key={ix} className="panel panel-default">
                <div className="panel-heading" onClick={e => this.handleSelect(e, ix)} >
                  <h4 className="panel-title">Versiyon {v._version}<br/><small>{v.modifiedAt.toFormattedTime()} - {v.createdBy()}</small></h4>
                </div>
                <div className={`panel-collapse collapse ${this.state.activePanel === ix ? 'in' : ''}`}>
                  <div className="panel-body">
                    {
                      this.state.activePanel === ix && React.createElement(
                        component,
                        {
                          staticForm: true,
                          record: v,
                          schema,
                          ...props,
                        }
                      )
                    }
                  </div>
                </div>
              </div>
            )
          }
        </div>
      }
    </div>
  }
}
