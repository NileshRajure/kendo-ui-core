
package com.kendoui.taglib.scheduler;

import com.kendoui.taglib.FunctionTag;

import com.kendoui.taglib.SchedulerTag;


import javax.servlet.jsp.JspException;

@SuppressWarnings("serial")
public class RemoveFunctionTag extends FunctionTag /* interfaces */ /* interfaces */ {
    
    @Override
    public int doEndTag() throws JspException {
//>> doEndTag


        SchedulerTag parent = (SchedulerTag)findParentWithClass(SchedulerTag.class);


        parent.setRemove(this);

//<< doEndTag

        return super.doEndTag();
    }

    @Override
    public void initialize() {
//>> initialize
//<< initialize

        super.initialize();
    }

    @Override
    public void destroy() {
//>> destroy
//<< destroy

        super.destroy();
    }

//>> Attributes
//<< Attributes

}