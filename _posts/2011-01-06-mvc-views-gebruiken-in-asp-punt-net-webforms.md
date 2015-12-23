---
layout:         post-tweakers
title:          "MVC Views gebruiken in ASP.NET Webforms"
date:           2011-01-06T12:51:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/5902/mvc-views-gebruiken-in-asp-punt-net-webforms.html
originalName:   Coding Glamour
language:       nl
commentCount:   2
commentUrl:     http://glamour.tweakblogs.net/blog/5902/mvc-views-gebruiken-in-asp-punt-net-webforms.html#reacties
---

   <p class="article">Wanneer je een hybride website hebt, waarin zowel MVC als Webforms gebruikt
  worden; een niet ongewoon scenario wanneer je website constant in development
  is; kan het gebeuren dat je veelgebruikte controls (zoals bijvoorbeeld
  een &apos;Login&apos; control) in Webforms schrijft omdat je ze dan voor
  allebei de architecturen kan gebruiken.
  <br>
  <br>Vandaar het &apos;ViewRenderer&apos; control, een CustomControl dat MVC
  Views kan renderen in Webforms controls. Syntax?
  <br>
  <br>
{% highlight asp %}
<Mvc:ViewControl runat="server" ViewName="~/Views/Shared/Login.ascx"/>
{% endhighlight %}
  <!--more-->
<b>Views renderen</b>
  <br>Om dit te bouwen, moeten we de output van de view kunnen renderen naar
  een string; die we vervolgens weer kunnen neerzetten op de Webforms pagina.
  In MVC 1 is hier een probleem omdat de &apos;HtmlHelper.RenderPartial&apos;
  naar de HttpContext schrijft. Hier is omheen te werken:
  <br>
  <br>
{% highlight csharp %}
/// <summary>
/// See http://www.klopfenstein.net/lorenz.aspx/render-partial-view-to-string-in-asp-net-mvc
/// based on http://stackoverflow.com/questions/483091/render-a-view-as-a-string
/// </summary>
public static class RenderPartialViewHelper
{
    /// <summary>Renders a view to string.</summary>
    public static string RenderViewToString(this Controller controller,
                                            string viewName, object viewData)
    {
        //Create memory writer 
        var sb = new StringBuilder();
        var memWriter = new StringWriter(sb);
        // Set some defaults
        controller.ControllerContext = new ControllerContext();
        controller.ControllerContext.Controller = controller;
        controller.ControllerContext.RouteData.Values.Add("controller", controller.GetType().Name.Replace("Controller", ""));
        //Create fake http context to render the view 
        var fakeResponse = new HttpResponse(memWriter);
        var fakeContext = new HttpContext(HttpContext.Current.Request, fakeResponse);
        var fakeControllerContext = new ControllerContext(
            new HttpContextWrapper(fakeContext),
            controller.ControllerContext.RouteData,
            controller.ControllerContext.Controller);
        // store current context, and set fake one
        var oldContext = HttpContext.Current;
        HttpContext.Current = fakeContext;
        //Use HtmlHelper to render partial view to fake context 
        var html = new HtmlHelper(new ViewContext(fakeControllerContext,
            new FakeView(), viewDataDictionary, new TempDataDictionary()),
            new ViewPage());
        html.RenderPartial(viewName, viewData, viewDataDictionary);
        //Restore context 
        HttpContext.Current = oldContext;
        //Flush memory and return output 
        memWriter.Flush();
        return sb.ToString();
    }
    /// <summary>Fake IView implementation used to instantiate an HtmlHelper.</summary>
    public class FakeView : IView
    {
        public void Render(ViewContext viewContext, System.IO.TextWriter writer)
        {
            throw new NotImplementedException();
        }
    }
}
{% endhighlight %}
  <br>Voor MVC 2 is de syntax iets anders, omdat je hier zelf een TextWriter
  kan defini&#xEB;ren waarheen geschreven wordt:
  <br>
  <br>
{% highlight csharp %}
public static class RenderPartialViewHelper
{
    /// <summary>Renders a view to string.</summary>
    public static string RenderViewToString(this Controller controller,
                                            string viewName, object viewData)
    {
        //Create memory writer 
        var sb = new StringBuilder();
        var memWriter = new StringWriter(sb);
        // Set some defaults
        controller.ControllerContext = new ControllerContext();
        controller.ControllerContext.Controller = controller;
        controller.ControllerContext.RouteData.Values.Add("controller", controller.GetType().Name.Replace("Controller", ""));
        //Create fake http context to render the view 
        var fakeResponse = new HttpResponse(memWriter);
        var fakeContext = new HttpContext(HttpContext.Current.Request, fakeResponse);
        var fakeControllerContext = new ControllerContext(
            new HttpContextWrapper(fakeContext),
            controller.ControllerContext.RouteData,
            controller.ControllerContext.Controller);
        using (MemoryStream ms = new MemoryStream())
        {
            using (TextWriter tw = new StreamWriter(ms))
            {
                //Use HtmlHelper to render partial view to fake context 
                var html = new HtmlHelper(new ViewContext(fakeControllerContext,
                                                          new FakeView(), viewDataDictionary, new TempDataDictionary(), tw),
                                          new ViewPage());
                html.RenderPartial(viewName, viewData, viewDataDictionary);
                tw.Flush();
                ms.Seek(0, SeekOrigin.Begin);
                using (StreamReader sr = new StreamReader(ms))
                {
                    return sr.ReadToEnd();
                }
            }
        }
    }
    /// <summary>Fake IView implementation used to instantiate an HtmlHelper.</summary>
    public class FakeView : IView
    {
        public void Render(ViewContext viewContext, System.IO.TextWriter writer)
        {
            throw new NotImplementedException();
        }
    }
}
{% endhighlight %}
  <br>
  <br>
<b>Custom Control</b>
  <br>Om de bovenstaande code te gebruiken, moeten we een wrapper maken op basis
  van een CompositeControl; zodat we deze kunnen toevoegen in een Webforms
  pagina:
  <br>
  <br>
{% highlight csharp %}
    public class MvcViewControl : CompositeControl
    {
        public string ViewName { get; set; }
        public object ViewModel { get; set; } 
        private string RenderedData
        {
            get { return ViewState[this.UniqueID + ".renderedData"] as string; }
            set { ViewState[this.UniqueID + ".renderedData"] = value; }
        }
        public MvcViewControl()
        {
            base.EnableViewState = true;
        }
        public override void RenderBeginTag(System.Web.UI.HtmlTextWriter writer)
        {
            // geen begin tag
        }
        public override void RenderEndTag(System.Web.UI.HtmlTextWriter writer)
        {
            // ook niet
        }
        protected override void CreateChildControls()
        {
            if (RenderedData == null)
                RenderedData = new BaseController().RenderViewToString(ViewName, ViewModel);
            this.Controls.Add(new Literal()
                              {
                                  Text = RenderedData
                              });
        }
    }
{% endhighlight %}
  <br>
  <br>
<b>Gebruik</b>
  <br>Het control kan eenvoudig worden gebruikt door eerst de namespace waarin
  je je control hebt toegevoegd te referencen, en deze vervolgens als normaal
  control te gebruiken:
  <br>
  <br>
{% highlight asp %}
<%@ Register Assembly="Funda.Web.Common.MvcWrapper" Namespace="Funda.Web.Common.MvcWrapper.CustomControls" TagPrefix="mvc" %>

<mvc:MvcViewControl runat="server" ViewName="~/views/shared/login.ascx" ID="Login"/>
{% endhighlight %}
  <br>
  <br>
<b>Model</b>
  <br>Wanneer je view een Model nodig hebt, dan kan je deze toevoegen in de
  codebehind.
  <br>
  <br>
{% highlight csharp %}
protected void Page_Init(object sender, EventArgs e)
{
    Login.ViewControl = new LoginModel("Jan Jongboom");
}
{% endhighlight %}
  <br>
  <br>Done. Je kunt nu al je common controls gewoon schrijven in MVC.</p>
   