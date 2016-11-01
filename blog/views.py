# -*- coding: utf-8 -*-
from django.shortcuts import *
from django.http import HttpResponse
from blog.models import *
from home.models import *
from markdown import markdown
from django.db.models import Q
# Create your views here.
def blog_article(request,articleId):
    article=get_object_or_404(Article,pk=int(articleId))
    data={
        'navitems':getNaviItem(),
        'article':article,
        'article_content':markdown(article.content,['extra','codehilite']),
        'tags':Tag.objects.all()
    }

    return render(request,"article.html",data)

def blog_index(request):
    data={
        'navitems':getNaviItem(),
        'title':"BIM & Coding",
        'sub_title':"高尚的博客",
        'article_list':Article.objects.all().order_by('-time'),
        'tags':Tag.objects.all()
    }
    return render(request,"blog.html",data)

def tag(request,tagId):
    tag=get_object_or_404(Tag,pk=int(tagId))
    data={
        'navitems':getNaviItem(),
        'title':tag.name,
        'sub_title':"标签",
        'article_list':tag.article_set.all().order_by('-time'),
        'tags':Tag.objects.all()
    }
    return render(request,"blog.html",data)

def search(request):
    keyword=request.GET['keyword']
    data={
        'navitems':getNaviItem(),
        'title':keyword,
        'sub_title':"搜索结果",
        'article_list':Article.objects.filter(title__contains=keyword),
        'tags':Tag.objects.all()
    }
    return render(request,"blog.html",data)

def getNaviItem():
    items = []
    for item in NavItem.objects.all():
        if (item.name=='博客'):
            item.active=True
        else:
            item.active=False
        items.append(item)
    return items
    