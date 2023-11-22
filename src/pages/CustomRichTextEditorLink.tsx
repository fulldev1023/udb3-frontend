import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Source: https://github.com/jpuri/react-draft-wysiwyg/blob/master/src/components/Option/index.js#L8
 */
function Option({
  onClick,
  children,
  value,
  className,
  activeClassName = '',
  active = false,
  disabled = false,
  title,
}) {
  return (
    <div
      className={classNames('rdw-option-wrapper', className, {
        [`rdw-option-active ${activeClassName}`]: active,
        'rdw-option-disabled': disabled,
      })}
      onClick={() => {
        if (!disabled) {
          onClick(value);
        }
      }}
      aria-selected={active}
      title={title}
    >
      {children}
    </div>
  );
}

/**
 * Source: https://github.com/jpuri/react-draft-wysiwyg/blob/master/src/controls/Link/Component/index.js#L203
 */
class CustomRichTextEditorLink extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    doExpand: PropTypes.func,
    doCollapse: PropTypes.func,
    onExpandEvent: PropTypes.func,
    config: PropTypes.object,
    onChange: PropTypes.func,
    currentState: PropTypes.object,
    translations: PropTypes.object,
  };

  state = {
    showModal: false,
    linkTarget: '',
    linkTitle: '',
    linkTargetOption: this.props.config.defaultTargetOption,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.expanded && !this.props.expanded) {
      this.setState({
        showModal: false,
        linkTarget: '',
        linkTitle: '',
        linkTargetOption: this.props.config.defaultTargetOption,
      });
    }
  }

  removeLink = () => {
    const { onChange } = this.props;
    onChange('unlink');
  };

  addLink = () => {
    const { onChange } = this.props;
    const { linkTitle, linkTarget, linkTargetOption } = this.state;
    onChange('link', linkTitle, linkTarget, linkTargetOption);
  };

  updateValue = (event) => {
    this.setState({
      [`${event.target.name}`]: event.target.value,
    });
  };

  signalExpandShowModal = () => {
    const {
      onExpandEvent,
      currentState: { link, selectionText },
    } = this.props;
    const { linkTargetOption } = this.state;
    onExpandEvent();
    this.setState({
      showModal: true,
      linkTarget: (link && link.target) || '',
      linkTargetOption: (link && link.targetOption) || linkTargetOption,
      linkTitle: (link && link.title) || selectionText,
    });
  };

  renderAddLinkModal() {
    const {
      config: { popupClassName },
      doCollapse,
      translations,
    } = this.props;
    const { linkTitle, linkTarget } = this.state;
    return (
      <div
        className={classNames('rdw-link-modal', popupClassName)}
        onClick={(event) => event.stopPropagation()}
      >
        <label className="rdw-link-modal-label" htmlFor="linkTitle">
          {translations['components.controls.link.linkTitle']}
        </label>
        <input
          id="linkTitle"
          className="rdw-link-modal-input"
          onChange={this.updateValue}
          onBlur={this.updateValue}
          name="linkTitle"
          value={linkTitle}
        />
        <label className="rdw-link-modal-label" htmlFor="linkTarget">
          {translations['components.controls.link.linkTarget']}
        </label>
        <input
          id="linkTarget"
          className="rdw-link-modal-input"
          onChange={this.updateValue}
          onBlur={this.updateValue}
          name="linkTarget"
          value={linkTarget}
        />
        <span className="rdw-link-modal-buttonsection">
          <button
            className="rdw-link-modal-btn"
            onClick={this.addLink}
            disabled={!linkTarget || !linkTitle}
          >
            {translations['generic.add']}
          </button>
          <button className="rdw-link-modal-btn" onClick={doCollapse}>
            {translations['generic.cancel']}
          </button>
        </span>
      </div>
    );
  }

  render() {
    const {
      config: { options, link, unlink, className },
      currentState,
      expanded,
      translations,
    } = this.props;
    const { showModal } = this.state;
    return (
      <div
        className={classNames('rdw-link-wrapper', className)}
        aria-label="rdw-link-control"
      >
        {options.indexOf('link') >= 0 && (
          <Option
            value="unordered-list-item"
            className={classNames(link.className)}
            onClick={this.signalExpandShowModal}
            aria-haspopup="true"
            aria-expanded={showModal}
            title={link.title || translations['components.controls.link.link']}
          >
            <img src={link.icon} alt="" />
          </Option>
        )}
        {options.indexOf('unlink') >= 0 && (
          <Option
            disabled={!currentState.link}
            value="ordered-list-item"
            className={classNames(unlink.className)}
            onClick={this.removeLink}
            title={
              unlink.title || translations['components.controls.link.unlink']
            }
          >
            <img src={unlink.icon} alt="" />
          </Option>
        )}
        {expanded && showModal ? this.renderAddLinkModal() : undefined}
      </div>
    );
  }
}

export { CustomRichTextEditorLink };
