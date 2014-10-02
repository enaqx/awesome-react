 /** @jsx React.DOM */

var SearchBox = React.createClass({
  getInitialState: function(){
    return {
      value: 'Using refs'
    }
  },

  onInputChange: function(e){
    this.setState({
      value: this.refs.input.value
    });
    this.props.onChange(e);                
  },

  render: function(){
    return React.DOM.div({},
      new React.DOM.p({}, "Input some text:"),
      new React.DOM.input({ 
        ref: 'input',
        placeholder: this.props.defaultText,
        value: this.state.value,
        onChange: this.onInputChange
      })
    );
  }
});

var globalValue = '';

var render = function() {
  React.renderComponent(
    new React.DOM.div({},
      new SearchBox({ 
        onChange: function(e) {
          globalValue = e.target.value;
          render();
        }
      }), 
      new React.DOM.p({}, globalValue) 
    ),
    document.body
  );
};

render();