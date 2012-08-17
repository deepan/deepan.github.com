// JS Utils
Function.prototype.add_method = function(name, func) {
	if(!this.prototype[name]) {
		this.prototype[name] = func;
		return this;
	}
    return this;
}

Function.prototype.unsafe_add_method = function(name, func) {
	this.prototype[name] = func;
	return this;
}

Function.add_method('inherits', function(Parent) {
	function ImmediateConstructor() {
	}


	ImmediateConstructor.prototype = Parent.prototype;
	this.prototype = new ImmediateConstructor;
	this.prototype.constructor = this;
	return this;
});

//constants
var constants = ( function() {
	return {
		min_distance_from_parent_to_child : 15,
		leaf_node_enc_circle_radius : 35,
        text : {
            how_far_is_text_from_symbol: 4,
            color : '#1B5A63',
            font_size : '13',
            width : 8
        },
        node: {
            color: '#9FC4C9',
            hover_color : 'orange',
            stroke_width : 1,
            symbol_stroke_width: 2,
            bounding_circle_radius : 8,
            bounding_circle_stroke_width: 0,
        },
	}
}());

// UI drawings

var drawings = ( function() {
	var this_drawings = this;

    var Drawing = function(){
    }.add_method('hover_fun', function(){
        this.ui_element.attr({
            stroke: this.hover_color,
        });
    }).add_method('hover_out_fun', function(){
        this.ui_element.attr({
            stroke: this.color,
        });
    }).add_method('hover_element', function(){
        return this.ui_element;
    });

    var Text = function(text, location, displace_by, orientation){
        this.text = text;
        this.displace_by = displace_by;
        this.orientation = orientation;
        this.location = location;
        this.color = constants.text.color;
        this.width = constants.text.width;
        this.font_size = constants.text.font_size;
        this.hover_color = constants.node.hover_color;
    }.add_method('draw', function(){
        var text_location = this.location.displace(new math.Location(0, drawings.text_orientation.top === this.orientation ? this.displace_by: -this.displace_by));
        var text_element =  slate.instance().text(text_location.x, text_location.y, this.trunc_text());
        
        this.ui_element = text_element.attr({
            fill : this.color,
            'font-size' : this.font_size,
            'cursor': 'default'
        });
        return this.ui_element;
    }).add_method('trunc_text', function(){
        return  this.text.length > this.width ? this.text.substring(0, this.width - 3) + '...': this.text;
    }).add_method('hover_fun', function(){
        this.ui_element.attr({
            fill: this.hover_color,
            text: this.text 
        });
    }).add_method('hover_out_fun', function(){
        this.ui_element.attr({
            fill: this.color,
            text: this.trunc_text()
        });
    }).add_method('hover_element', function(){
        return slate.instance().rect().attr(this.ui_element.getBBox()).attr({
            fill: "#000",
            opacity: 0,
        });
    }).add_method('remove', function(){
        this.ui_element.remove();
    });
	
    var Line = function(location) {
		this.path = 'M ' + location.x + ' ' + location.y + ' ';

	}.add_method('left', function(distance) {
		this.path = this.path + 'l ' + distance + ' 0 ';
		return this;
	}).add_method('right', function(distance) {
		this.path = this.path + 'l -' + distance + ' 0 ';
		return this;
	}).add_method('top', function(distance) {
		this.path = this.path + 'l 0 -' + distance;
		return this;
	}).add_method('bottom', function(distance) {
		this.path = this.path + 'l 0 ' + distance;
		return this;
	}).add_method('to_string', function() {
		return this.path;
	}).add_method('to', function(location) {
		this.path = this.path + 'L ' + location.x + ' ' + location.y;
		return this;
	});
    
    var Minus = function(radius_of_minus, center, color, stroke_width){
        this.radius_of_minus = radius_of_minus;
        this.center = center;
        this.color = color;
        this.stroke_width = stroke_width;
        this.hover_color = constants.node.hover_color;
    }.inherits(Drawing).add_method('draw', function(){
		var minus = slate.instance().path(new Line(this.center).left(this.radius_of_minus).right(2 * this.radius_of_minus).to_string());
		this.ui_element = minus.attr({
			stroke : this.color,
			'stroke-width' : this.stroke_width
		});        
        return this.ui_element;
    }).add_method('remove', function(){
        this.ui_element.remove();
    });
    
    var Plus = function(radius_of_plus, center, color, stroke_width){
        this.radius_of_plus = radius_of_plus;
        this.center = center;
        this.color = color;
        this.stroke_width = stroke_width;
        this.hover_color = constants.node.hover_color;
    }.inherits(Drawing).add_method('draw', function(){
		var plus = slate.instance().path(new Line(this.center).left(this.radius_of_plus).right(2 * this.radius_of_plus).left(this.radius_of_plus).top(this.radius_of_plus).bottom(2 * this.radius_of_plus).to_string());
		this.ui_element = plus.attr({
			stroke : this.color,
			'stroke-width' : this.stroke_width
		});    
        return this.ui_element;
    }).add_method('remove', function(){
        this.ui_element.remove();
    });
    
    var Circle = function(radius, center, color, stroke_width){
        this.radius = radius;
        this.center = center;
        this.color = color;
        this.stroke_width = stroke_width;
        this.hover_color = constants.node.hover_color;
    }.inherits(Drawing).add_method('draw', function(){
		var circle = slate.instance().circle(this.center.x, this.center.y, this.radius);
		this.ui_element = circle.attr({
			stroke : this.color,
			'stroke-width' : this.stroke_width,
			fill : 'white',
			'fill-opacity' : 0
		});   
        return this.ui_element;
    }).add_method('remove', function(){
        this.ui_element.remove();
    });

    var Connector = function(from, to, through){
        this.from = from;
        this.to = to;
        this.through = through;
        this.stroke_width = constants.node.stroke_width;
        this.color = constants.node.color;
        this.hover_color = constants.node.hover_color;
        this.hover_stroke_width = constants.node.symbol_stroke_width;
    }.inherits(Drawing).add_method('draw', function(){
        var line = new Line(this.from);
        $.each(util.safe_list([this.through, this.to]), function(index, point){
            line.to(point)
        });
		var line_element = slate.instance().path(line.to_string()).toBack();

        this.ui_element = line_element.attr({
            stroke : this.color,
            'stroke-width' : this.stroke_width
        });
        return this.ui_element;
    }).add_method('remove', function(){
        this.ui_element.remove();
    }).unsafe_add_method('hover_fun', function(){
        this.ui_element.attr({
            stroke: this.hover_color,
            'stroke-width': this.hover_stroke_width
        });
    }).unsafe_add_method('hover_out_fun', function(){
        this.ui_element.attr({
            stroke: this.color,
            'stroke-width': this.stroke_width
        });
    });
    
	var Node = function(location, text, text_orientation, connector) {
		initialize(location, text, text_orientation, connector);
	}.add_method('initialize', function(location, text, text_orientation, connector) {
		this.stroke_width = constants.node.stroke_width;
        this.symbol_stroke_width = constants.node.symbol_stroke_width;
		this.bounding_circle_radius = constants.node.bounding_circle_radius;
        this.bounding_circle_stroke_width = constants.node.bounding_circle_stroke_width;
		this.color = constants.node.color;
		this.center = location.clone();
        this.text = text;
        this.text_orientation = text_orientation;
        this.connector = connector;
		this.draw();
	}).add_method('radius_minus_one_point_five', function() {
		return this.bounding_circle_radius - this.stroke_width / 2 - 1.5;
	}).add_method('erase', function() {
		this.refs.remove();
	}).add_method('unbind_click_handler', function(id) {
		$(this.refs.boundry.ui_element.node).unbind('click.node_' + id);
	}).add_method('bind_click_handler', function(id, click_handler) {
		$(this.refs.boundry.ui_element.node).bind('click.node_' + id, click_handler);
	}).add_method('node_text', function(){
        return new Text(this.text, this.center, this.bounding_circle_radius + constants.text.how_far_is_text_from_symbol, this.text_orientation);
    });

    var NodeReference = function(symbol, boundry, text, connector){
        this.symbol = symbol;
        this.boundry = boundry;
        this.text = text;
        this.connector = connector;
    }.add_method('draw', function(){
        this.symbol.draw();
        this.boundry.draw();
        this.text.draw();
        if(this.connector)
            this.connector.draw();
    }).add_method('remove', function(){
        this.symbol.remove();
        this.boundry.remove();
        this.text.remove();
        if(this.connector)
            this.connector.remove();        
    }).add_method('hover_fun', function(){
        var that = this;
        return function(){
            that.symbol.hover_fun();
            that.boundry.hover_fun();
            that.text.hover_fun();
            if(that.connector)
                that.connector.hover_fun();
        }
    }).add_method('hover_out_fun', function(){
        var that = this;
        return function(){
            that.symbol.hover_out_fun();
            that.boundry.hover_out_fun();
            that.text.hover_out_fun();
            if(that.connector)
                that.connector.hover_out_fun();
        }
    }).add_method('hover', function(){
        var ui_elements = slate.instance().set()
        ui_elements.push(
            this.symbol.hover_element(),
            this.boundry.hover_element(),
            this.text.hover_element()
        );
        if(this.connector)
            ui_elements.push(this.connector.hover_element());
        
        ui_elements.hover(this.hover_fun(), this.hover_out_fun());
    });

	var LeafNode = function(location, text, text_orientation, connector) {
		this.initialize(location, text, text_orientation, connector);
	}.inherits(Node).add_method('draw', function() {
		this.refs = new NodeReference(
			new Circle(this.bounding_circle_radius / 2, this.center, this.color, this.symbol_stroke_width),
            new Circle(this.bounding_circle_radius, this.center, this.color, this.bounding_circle_stroke_width),
			this.node_text(),
            this.connector);
        this.refs.draw();
        this.refs.hover();
		return this;
	});

	var ShrinkableNode = function(location, text, text_orientation, connector) {
		this.initialize(location, text, text_orientation, connector);
	}.inherits(Node)
    .add_method('draw', function() {
        this.refs = new NodeReference(
			new Minus(this.radius_minus_one_point_five(), this.center, this.color, this.symbol_stroke_width),
            new Circle(this.bounding_circle_radius, this.center, this.color, this.bounding_circle_stroke_width),
			this.node_text(),
            this.connector);
        this.refs.draw();
        this.refs.hover();
		return this;
	});
	var ExpandableNode = function(location, text, text_orientation, connector) {
		this.initialize(location, text, text_orientation, connector);
	}.inherits(Node)
    .add_method('draw', function() {
        this.refs = new NodeReference(
            new Plus(this.radius_minus_one_point_five(), this.center, this.color, this.symbol_stroke_width),
			new Circle(this.bounding_circle_radius, this.center, this.color, this.bounding_circle_stroke_width),
			this.node_text(),
            this.connector);
        this.refs.draw();
        this.refs.hover();
		return this;
	});

	return {
		leaf_node : function(location, text, text_orientation, connector){
			return new LeafNode(location, text, text_orientation, connector);
		},
		expandable_node : function(location, text, text_orientation, connector){
			return new ExpandableNode(location, text, text_orientation, connector);
		},
		shrinkable_node : function(location, text, text_orientation, connector){
			return new ShrinkableNode(location, text, text_orientation, connector);
		},
        connector : function(from, to, through){
            return new Connector(from, to, through);;
        },
        text_orientation: {
            top: 'top',
            bottom: 'bottom'
        },
	}
}());

// Canvas utils
var slate = ( function() {
	var inst;
	var width = 5000;
	var height = 5000;
	return {
		instance : function() {
			if(!inst) {
				//$('#canvas_container').draggable();
				inst = new Raphael($('#canvas_container').get(0), width, height);
			}
			return inst;
		},
		width : width,
		height : height
	}
}());

//util
var util = ( function(){
    return {
        safe_list : function(list){
            var list_with_out_undefined = [];
            $.each(list, function(index, element){
                if(element != undefined)
                    list_with_out_undefined.push(element);
            });
            return list_with_out_undefined;
        },
        safe : function(obj, property_names){
            if(obj == undefined)
                return undefined;
            var temp_result;
            for(i = 0; i < property_names.length; i++){
                temp_result = obj[property_names[i]];
                if(temp_result == undefined){
                    return undefined;
                }else{
                    obj = temp_result;
                }
            }
            return obj;
        }
    };
}());
//math
var math = ( function() {
	return {
		Location : function(x, y) {
			this.x = x;
			this.y = y;
		}.add_method('equal_after_rounding', function(location) {
			return Math.round(this.x) == Math.round(location.x) && Math.round(this.y) == Math.round(location.y);
		}).add_method('displace', function(location) {
			return new math.Location(this.x + location.x, this.y + location.y);
		}).add_method('equals', function(location){
            return location != undefined && this.x == location.x && this.y == location.y; 
        }).add_method('clone', function(){
        	return new math.Location(this.x, this.y);
        }),
		Circle : function(r) {
			this.r = r;
		}.add_method('set_location', function(location) {
			this.location = location;
			return this;
		}),
		sum : function(collection) {
			return eval(collection.join('+'));
		},
		to_radians : function(degree) {
			return degree * (Math.PI / 180);
		},
		sum_radius : function(enclosing_circles_of_child_nodes) {
			return math.sum($.map(enclosing_circles_of_child_nodes, function(circle, index) {
				return circle.r
			}));
		},
		allocate_a_pie : function(radius, sum_of_radius_of_all_circles) {
			return math.to_radians(radius * 360 / sum_of_radius_of_all_circles);
		},
		allocate_a_pie_out_of_a_pie : function(radius, sum_of_radius_of_all_circles, pie_angle) {
			return radius * pie_angle / sum_of_radius_of_all_circles;
		},
		fit_circle_with_in_pie : function(radius, angle_given_to_child) {
			return Math.max(constants.min_distance_from_parent_to_child + radius, radius / Math.sin(angle_given_to_child / 2));
		},
		position_child_relative_to_parent : function(distance_from_parent, angle_given_to_child, cumulative_angle_from_zero) {
			return new math.Location(distance_from_parent * (Math.cos(cumulative_angle_from_zero - angle_given_to_child / 2)), distance_from_parent * (Math.sin(cumulative_angle_from_zero - angle_given_to_child / 2)));
		},
		random : function(from, to) {
			return Math.floor(Math.random() * (to - from + 1) + from);
		},
		solve_quadratic_equation : function(coeff_of_x_sqr, coeff_of_x, constant) {
			return {
				sol1 : ((2 * constant) / (-coeff_of_x + Math.sqrt(Math.pow(coeff_of_x, 2) - (4 * coeff_of_x_sqr * constant)))),
				sol2 : ((2 * constant) / (-coeff_of_x - Math.sqrt(Math.pow(coeff_of_x, 2) - (4 * coeff_of_x_sqr * constant))))
			};
		},
		distance_between_two_points : function(point1, point2) {
			return Math.sqrt(Math.pow((point1.x - point2.x), 2) + Math.pow((point1.y - point2.y), 2));
		},
		point_on_line_at_a_distance : function(point1, point2, distance) {
			if(point1.x === point2.x) {
				return new math.Location(point1.x, point1.y + distance);
			} else {
				var slope = (point2.y - point1.y) / (point2.x - point1.x);
				var x = math.solve_quadratic_equation(1, -2 * point1.x, Math.pow(point1.x, 2) - Math.pow(distance, 2) / (1 + Math.pow(slope, 2)))
				var sol1 = new math.Location(x.sol1, slope * (x.sol1 - point1.x) + point1.y);
				var sol2 = new math.Location(x.sol2, slope * (x.sol2 - point1.x) + point1.y);
				return math.distance_between_two_points(sol1, point2) < math.distance_between_two_points(sol2, point2) ? sol1 : sol2;
			}
		},
		point_on_circle_projected_from_line_connecting_two_points_within_circle : function(point1, point2, circle) {
			var dx = point2.x - point1.x;
			var dy = point2.y - point1.y;
			var x_sqr_coeff = Math.pow(dx, 2) + Math.pow(dy, 2);
			var x_coeff = 2 * (dx * (point1.x - circle.location.x) + dy * (point1.y - circle.location.y));
			var constant = (point1.x - circle.location.x) * (point1.x - circle.location.x) + (point1.y - circle.location.y) * (point1.y - circle.location.y) - Math.pow(circle.r, 2);
			var t = math.solve_quadratic_equation(x_sqr_coeff, x_coeff, constant);
			var sol1 = point1.displace(new math.Location(t.sol1 * dx, t.sol1 * dy));
			var sol2 = point1.displace(new math.Location(t.sol2 * dx, t.sol2 * dy));
			return math.distance_between_two_points(sol1, point2) < math.distance_between_two_points(sol2, point2) ? sol1 : sol2;
		},
		angle_formed_by_two_points_on_the_circle_at_the_center : function(point1, point2, radius) {
			var p23 = math.distance_between_two_points(point1, point2);
			var p13 = radius;
			var p12 = radius;
			return Math.acos((Math.pow(p12, 2) + Math.pow(p13, 2) - Math.pow(p23, 2)) / (2 * p12 * p13));
		},
        bend : function(enc_circle, node_loc, parent_node_loc, connector_loc) {
            var point1 = math.point_on_line_at_a_distance(enc_circle.location, parent_node_loc, enc_circle.r);
            var point2 = math.point_on_circle_projected_from_line_connecting_two_points_within_circle(node_loc, connector_loc, enc_circle);
            var angle = math.angle_formed_by_two_points_on_the_circle_at_the_center(point1, point2, enc_circle.r);
            var point_after_rotation = math.move_point_based_on_circle_rotation(point1, angle, enc_circle.location);

            return {angle: point_after_rotation.equal_after_rounding(point2) ? 2 * Math.PI - angle : angle, connection_point: point1};
        },
		move_point_based_on_circle_rotation : function(point, angle, circle_loc) {
			return circle_loc.displace(new math.Location((Math.cos(angle) * (point.x - circle_loc.x) - Math.sin(angle) * (point.y - circle_loc.y)), (Math.cos(angle) * (point.y - circle_loc.y) + Math.sin(angle) * (point.x - circle_loc.x))));
		},
		is_within : function(outer_circle, inner_circle) {
			return (outer_circle != null) && outer_circle.r >= Math.sqrt(Math.pow((outer_circle.location.x - inner_circle.location.x), 2) + Math.pow((outer_circle.location.y - inner_circle.location.y), 2)) + inner_circle.r;
		},
		smallest_enclosing_circle_for_3_circles : function(circles) {
			var c1 = circles[0];
			var c2 = circles[1];
			var c3 = circles[2];
			var a1 = (((Math.pow(c1.r, 2) - Math.pow(c1.location.x, 2) - Math.pow(c1.location.y, 2) - Math.pow(c2.r, 2) + Math.pow(c2.location.x, 2) + Math.pow(c2.location.y, 2)) / (2 * (c2.location.y - c1.location.y))) - ((Math.pow(c1.r, 2) - Math.pow(c1.location.x, 2) - Math.pow(c1.location.y, 2) - Math.pow(c3.r, 2) + Math.pow(c3.location.x, 2) + Math.pow(c3.location.y, 2)) / (2 * (c3.location.y - c1.location.y)))) / (((c2.location.x - c1.location.x) / (c2.location.y - c1.location.y)) - ((c3.location.x - c1.location.x) / (c3.location.y - c1.location.y)));
			var b1 = ((((c1.r - c2.r) / (c2.location.y - c1.location.y)) - ((c1.r - c3.r) / (c3.location.y - c1.location.y))) / (((c2.location.x - c1.location.x) / (c2.location.y - c1.location.y)) - ((c3.location.x - c1.location.x) / (c3.location.y - c1.location.y))));
			var a2 = (((Math.pow(c1.r, 2) - Math.pow(c1.location.x, 2) - Math.pow(c1.location.y, 2) - Math.pow(c2.r, 2) + Math.pow(c2.location.x, 2) + Math.pow(c2.location.y, 2)) / (2 * (c2.location.x - c1.location.x))) - ((Math.pow(c1.r, 2) - Math.pow(c1.location.x, 2) - Math.pow(c1.location.y, 2) - Math.pow(c3.r, 2) + Math.pow(c3.location.x, 2) + Math.pow(c3.location.y, 2)) / (2 * (c3.location.x - c1.location.x)))) / (((c2.location.y - c1.location.y) / (c2.location.x - c1.location.x)) - ((c3.location.y - c1.location.y) / (c3.location.x - c1.location.x)));
			var b2 = ((((c1.r - c2.r) / (c2.location.x - c1.location.x)) - ((c1.r - c3.r) / (c3.location.x - c1.location.x))) / (((c2.location.y - c1.location.y) / (c2.location.x - c1.location.x)) - ((c3.location.y - c1.location.y) / (c3.location.x - c1.location.x))));

			// R^2(b1^2 + b2^2 -1) - 2R(a1 b1 - c1.loc.x b1 + a2 b2 - c1.loc.y b2 - c1.r) + (a1^2 + c1.loc.x^2 - 2 c1.loc.x a1+ a2^2 + c1.loc.y^2 - 2 c1.loc.y a2 - c1.r^2) = 0

			var coeff_of_x_sqr = Math.pow(b1, 2) + Math.pow(b2, 2) - 1;
			var coeff_of_x = -2 * ((a1 * b1) - (c1.location.x * b1) + (a2 * b2) - (c1.location.y * b2) - c1.r);
			var constant = Math.pow(a1, 2) + Math.pow(c1.location.x, 2) - (2 * c1.location.x * a1) + Math.pow(a2, 2) + Math.pow(c1.location.y, 2) - (2 * c1.location.y * a2) - Math.pow(c1.r, 2);
			var r = math.solve_quadratic_equation(coeff_of_x_sqr, coeff_of_x, constant).sol1;
			var x = a1 - (r * b1);
			var y = a2 - (r * b2);
			return new math.Circle(r).set_location(new math.Location(x, y));
		},
		smallest_enclosing_circle_for_2_circles : function(circles) {
			var c1 = circles[0];
			var c2 = circles[1];
			var angle = Math.atan2(c2.location.y - c1.location.y, c2.location.x - c1.location.x);
			var point1 = c2.location.displace(new math.Location(Math.cos(angle) * c2.r, Math.sin(angle) * c2.r));
			angle = angle + Math.PI;
			var point2 = c1.location.displace(new math.Location(Math.cos(angle) * c1.r, Math.sin(angle) * c1.r));
			var r = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)) / 2;
			if(r < c1.r) {
				return new math.Circle(c1.r).set_location(new math.Location(c1.location.x, c1.location.y));
			} else if(r < c2.r) {
				return new math.Circle(c2.r).set_location(new math.Location(c2.location.x, c2.location.y));
			} else {
				return new math.Circle(r).set_location(new math.Location((point1.x + point2.x) / 2, (point1.y + point2.y) / 2));
			}
		},
		smallest_enclosing_circle_of_circles : function(circles, boundry_circles) {
			var smallest_enclosing_circle;
			if(circles.length === 0) {
				if(boundry_circles.length === 0) {
					smallest_enclosing_circle = null;
				} else if(boundry_circles.length === 1) {
					smallest_enclosing_circle = boundry_circles[0];
				} else if(boundry_circles.length === 2) {
					smallest_enclosing_circle = math.smallest_enclosing_circle_for_2_circles(boundry_circles);
				}
			} else {
				var random_circle_index = math.random(0, circles.length - 1);
				var circles_clone = circles.slice();
				var random_circle = circles_clone.splice(random_circle_index, 1)[0];
				smallest_enclosing_circle = math.smallest_enclosing_circle_of_circles(circles_clone, boundry_circles);
				if(!math.is_within(smallest_enclosing_circle, random_circle)) {
					var random_circle_added_to_boundry_circles = boundry_circles.concat([random_circle]);
					if(boundry_circles.length <= 1) {
						smallest_enclosing_circle = math.smallest_enclosing_circle_of_circles(circles_clone, random_circle_added_to_boundry_circles);
					} else {
						smallest_enclosing_circle = math.smallest_enclosing_circle_for_3_circles(random_circle_added_to_boundry_circles);
					}
				}
			}
			return smallest_enclosing_circle;// != null? new math.Circle(smallest_enclosing_circle.r + 2).set_location(smallest_enclosing_circle.location.clone()): null;
		},
		position_children_relative_to_parent : function(enclosing_circles_of_children) {
			var sum_of_radius_of_all_child_enc_circles = math.sum_radius(enclosing_circles_of_children);

			var cumulative_angle_from_zero = 0;
			var pie_allocated_to_circles = $.map(enclosing_circles_of_children, function assign_pie_relative_to_enc_circle_size(child_enc_circle, index) {
				return {
					angle : math.allocate_a_pie(child_enc_circle.r, sum_of_radius_of_all_child_enc_circles),
					radius : child_enc_circle.r
				};
			});
			var angle_to_be_shared_by_smaller_circles = 0;
			var sum_of_radius_of_smaller_circles = 0;
			$.each(pie_allocated_to_circles, function do_not_give_angle_more_than_pi_to_any_circle(index, angle_and_radius) {
				if(angle_and_radius.angle > Math.PI) {
					angle_to_be_shared_by_smaller_circles = angle_to_be_shared_by_smaller_circles + angle_and_radius.angle - Math.PI;
				} else {
					sum_of_radius_of_smaller_circles = sum_of_radius_of_smaller_circles + angle_and_radius.radius;
				}
			});
			return $.map(enclosing_circles_of_children, function assign_pie_relative_to_enc_circle_size(child_enc_circle, index) {
				var angle_given_to_child = (pie_allocated_to_circles[index].angle > Math.PI) ? Math.PI : pie_allocated_to_circles[index].angle + math.allocate_a_pie_out_of_a_pie(child_enc_circle.r, sum_of_radius_of_smaller_circles, angle_to_be_shared_by_smaller_circles);
				var distance_from_parent = math.fit_circle_with_in_pie(child_enc_circle.r, angle_given_to_child);
				cumulative_angle_from_zero += angle_given_to_child;
				return new math.Circle(child_enc_circle.r).set_location(math.position_child_relative_to_parent(distance_from_parent, angle_given_to_child, cumulative_angle_from_zero));
			});
		},
		position_children_relative_to_parent_2 : function(circles) {
			var angle_available = 2 * Math.PI;
			var sum_of_radius_of_all_circles = math.sum_radius(circles);
			var indexed_circles = $.map(circles, function(circle, index) {
				circle.index = index;
				return circle;
			});
			indexed_circles.sort(function(circle1, circle2) {
				return circle1.r < circle2.r
			});
			var all_sectors_are_set_to_max_angle = true;
			$.each(indexed_circles, function(index, circle) {
				var angle_proptional_to_radius = angle_available * circle.r / sum_of_radius_of_all_circles;
				var max_angle_that_can_be_allocated = 2 * Math.asin(circle.r / (circle.r + circles.length));

				if(angle_proptional_to_radius > max_angle_that_can_be_allocated) {
					circle.pie_angle = max_angle_that_can_be_allocated;
					angle_available = angle_available - max_angle_that_can_be_allocated;
					sum_of_radius_of_all_circles = sum_of_radius_of_all_circles - circle.r;
				} else {
					all_sectors_are_set_to_max_angle = false;
					circle.pie_angle = angle_proptional_to_radius;
				}
			});
			var cumulative_angle_from_zero = 0;
			var share_of_remaining_angle = angle_available / circles.length;
			indexed_circles.sort(function(circle1, circle2) {
				return circle1.index > circle2.index
			});
			return $.map(indexed_circles, function(circle, index) {
				var angle_given_to_te_circle = all_sectors_are_set_to_max_angle ? circle.pie_angle + share_of_remaining_angle : circle.pie_angle;
				var distance_from_parent = math.fit_circle_with_in_pie(circle.r, angle_given_to_te_circle);
				cumulative_angle_from_zero = cumulative_angle_from_zero + angle_given_to_te_circle;
				return new math.Circle(circle.r).set_location(math.position_child_relative_to_parent(distance_from_parent, angle_given_to_te_circle, cumulative_angle_from_zero));
			})
		},
		relative_position : function(point, in_relation_with, relative_to) {
			return point.displace(new math.Location(relative_to.x - in_relation_with.x, relative_to.y - in_relation_with.y));
		}
	}
}());

// Bubble tree viewer
var node_sequencer = ( function() {
	var id = 1;
	var inst;

	function init() {
		return {
			next_id : function() {
				id += 1;
				return id;
			}
		}
	}

	return {
		instance : function() {
			if(!inst) {
				inst = init();
			}
			return inst;
		}
	}
}());
 

var Node = function(title) {
	this.title = title;
    this.state = new NoState();
	this.children = [];
    this.ui = {};
}

Node.prototype.traverse_breadth_first_and_execute = function(function_on_parent, function_on_leaf_child, function_on_non_leaf_child, args1){
    var node = this;
    (function breadth_first_traversal(args, node){
        var response_from_function_on_parent = function_on_parent(args, node);
        if(args.should_process_children){
            $.each(node.children, function(index, child_node){
                if(child_node.is_leaf()) {    
                    function_on_leaf_child(child_node, node, response_from_function_on_parent);
                }else{
                    var response_from_function_on_non_leaf_child = function_on_non_leaf_child(child_node, node, response_from_function_on_parent);
                    breadth_first_traversal(response_from_function_on_non_leaf_child, child_node);
                }
            });
        }
    }(args1, node));
}

Node.prototype.paint = function(location){
    this.traverse_breadth_first_and_execute(
        function draw_node(args, node){
            var node_loc = util.safe(node, ['coordinate', 'location']);
            var bend_connection_point = util.safe(node, ['coordinate', 'bend_connection_point']);
            var parent_location = typeof(args.parent_location) != 'undefined' ? args.parent_location : node_loc != undefined ? node_loc.clone(): undefined; 
            node.draw_node_and_connector(args.location, node_loc, parent_location, bend_connection_point);
            return {location: args.location};
        }, 
        function draw_leaf_node(child_node, node, response_from_function_on_parent){
            var child_node_loc = util.safe(child_node, ['coordinate', 'location']);
            var parent_node_loc = util.safe(node, ['coordinate', 'location']);
			child_node.draw_node_and_connector(response_from_function_on_parent.location, child_node_loc, parent_node_loc);            
        },
        function draw_non_leaf_node(child_node, node, response_from_function_on_parent){ 
            return {location : util.safe(response_from_function_on_parent, ['location']), parent_location: util.safe(node.coordinate, ['location']), should_process_children : true};
        },
        {location: location, should_process_children : true}
    );
}

Node.prototype.assign_coordinates = function(){
    this.traverse_breadth_first_and_execute(
        function draw_node(args, node){
            var location = args.location;
            var parent_location = typeof(args.parent_location) != 'undefined' ? args.parent_location : new math.Location(0, 0);
	
            var enc_circle = new math.Circle(node.enc_circle.r).set_location(location.displace(new math.Location(node.enc_circle.location.x, node.enc_circle.location.y)));
            //slate.instance().circle(enc_circle.location.x + enc_circle.location.x, enc_circle.location.y + enc_circle.location.y, enc_circle.r);
		
            var bend = node.connector_to_my_parent ? math.bend(enc_circle, location, parent_location, location.displace(new math.Location(node.connector_to_my_parent.location.x, node.connector_to_my_parent.location.y))) : {angle: 0, connection_point: undefined};
            var location_after_bend = math.move_point_based_on_circle_rotation(location, bend.angle, enc_circle.location);    
            node.coordinate = {location: location_after_bend, bend_connection_point: bend.connection_point};
            return {location: location, location_after_bend: location_after_bend, bend: bend, enc_circle: enc_circle};
        },
        function draw_leaf_node(child_node, node, response_from_function_on_parent){
            child_node.coordinate = {location: math.move_point_based_on_circle_rotation(response_from_function_on_parent.location.displace(new math.Location(child_node.dist_from_parent.x, child_node.dist_from_parent.y)), response_from_function_on_parent.bend.angle, response_from_function_on_parent.enc_circle.location)};
        },
        function draw_non_leaf_node(child_node, node, response_from_function_on_parent){
            return {location: math.move_point_based_on_circle_rotation(response_from_function_on_parent.location.displace(new math.Location(child_node.dist_from_parent.x, child_node.dist_from_parent.y)), response_from_function_on_parent.bend.angle, response_from_function_on_parent.enc_circle.location).displace(new math.Location(-child_node.enc_circle.location.x, -child_node.enc_circle.location.y)), 
                    parent_location: response_from_function_on_parent.location_after_bend,
                    should_process_children: child_node.children[0].state.title != 'no state'};
        },
        {should_process_children: this.children[0].state.title != 'no state', location: this.coordinate.location}
    );
}

Node.prototype.draw_node_and_connector = function(relative_location, location, parent_location, connection_point){
    if(this.ui.node){
        this.ui.node.erase();
    }
    if(this.ui.connector){
        this.ui.connector.remove();
    }    
    this.state.draw(this, relative_location, location, parent_location, connection_point);
}


Node.prototype.is_leaf = function() {
	return this.children.length == 0;
}

Node.prototype.compute_rel_position = function(is_root_node) {
	is_root_node = typeof(is_root_node) != 'undefined' ? is_root_node : true;
	var node = this;
	if(this.is_leaf() || this.children[0].state.title == 'no state') {
		this.enc_circle = new math.Circle(constants.leaf_node_enc_circle_radius).set_location(new math.Location(0, 0));
	}else{
		var dummy_node_for_parent_to_child_connection = (is_root_node) ? [] : [new math.Circle(constants.leaf_node_enc_circle_radius)];
		$.each(this.children, function(index, child_node) {
			child_node.compute_rel_position(false);
		});
		var children_positioned_rel_to_me = math.position_children_relative_to_parent(dummy_node_for_parent_to_child_connection.concat($.map(this.children, function(child_node, index) {
			return child_node.enc_circle;
		})));
		this.enc_circle = math.smallest_enclosing_circle_of_circles(children_positioned_rel_to_me, []);
		if(!is_root_node) {
			this.connector_to_my_parent = children_positioned_rel_to_me.splice(0, 1)[0];
		}
		$.each(this.children, function(index, child_node) {
			child_node.dist_from_parent = children_positioned_rel_to_me[index].location;
		});
	}
}

Node.prototype.attach_click_handlers = function() {
    var node = this;
    this.ui.node.bind_click_handler(this.id, function() {
        node.handle_click();
    });
}

Node.prototype.handle_click = function(){
	var node_location = this.coordinate.location;
    this.state = this.state.reset_state_on_click(this);
    this.root_node.compute_rel_position();
    this.root_node.assign_coordinates();
	this.root_node.relative_loc = this.root_node.relative_loc.displace(math.relative_position(this.root_node.coordinate.location, this.coordinate.location, node_location));
	this.root_node.paint(this.root_node.relative_loc);
}

Node.prototype.draw_node = function(location, parent_location, connector_bend_point, relative_location, node_type){
    var draw_connector_line_passing_connection_point = function(from, connection_point, to){
        return drawings.connector(math.point_on_line_at_a_distance(from, connection_point, constants.node.bounding_circle_radius),
                                  math.point_on_line_at_a_distance(to, connection_point, constants.node.bounding_circle_radius),
                                  connection_point);
    };

    var draw_connector_line = function(from, to){
        return drawings.connector(math.point_on_line_at_a_distance(from, to, constants.node.bounding_circle_radius),
                                  math.point_on_line_at_a_distance(to, from, constants.node.bounding_circle_radius));
    };

    var text_orientation = location.y > util.safe(parent_location, ['y']) ? drawings.text_orientation.top: drawings.text_orientation.bottom;
    location = relative_location.displace(location);

    var connector;
    if(parent_location && !location.equals(relative_location.displace(parent_location))){
        parent_location = relative_location.displace(parent_location);
        connector = connector_bend_point? draw_connector_line_passing_connection_point(location, relative_location.displace(connector_bend_point), parent_location): draw_connector_line(location, parent_location);
    }

    this.ui = {'node': drawings[node_type](location, this.title, text_orientation, connector)};
}

var ExpandableState = function() {
    this.title = 'expandable state';
}.add_method('draw', function(node, relative_location, location, parent_location, connector_bend_point){
    node.draw_node(location, parent_location, connector_bend_point, relative_location, 'expandable_node');
    node.attach_click_handlers();
}).add_method('reset_state_on_click', function(node){
	$.each(node.children, function(index, child){
		if(child.is_leaf()){
			child.state = new LeafState();
		}else{
			child.state = new ExpandableState();
		}
	});
    return new ShrinkableState();
});

var ShrinkableState = function(){
    this.title = 'shrinkable state';
}.add_method('draw', function(node, relative_location, location, parent_location, connector_bend_point){
    node.draw_node(location, parent_location, connector_bend_point, relative_location, 'shrinkable_node');    
    node.attach_click_handlers();
}).add_method('reset_state_on_click', function(node){
	$.each(node.children, function(index, child){
		child.state = new NoState();
        child.state.reset_state_on_click(child);
	});
    return new ExpandableState();
});

var NoState = function(){
    this.title = 'no state';
}.add_method('draw', function(node, relative_location, location, parent_location, connector_bend_point){
}).add_method('reset_state_on_click', function(node){
    $.each(node.children, function(index, child){
        child.state = new NoState();
        child.state.reset_state_on_click(child);
    });
    return new NoState();
});

var LeafState = function(){
    this.title = 'leaf state';
}.add_method('draw', function(node, relative_location, location, parent_location, connector_bend_point){
    node.draw_node(location, parent_location, connector_bend_point, relative_location, 'leaf_node');    
    node.attach_click_handlers();
}).add_method('reset_state_on_click', function(node){
    return new LeafState();
});

$(document).ready(function() {
	
	var map = new SpryMap({
	    id : "canvas_container",
    	height: $(window).height(),
		width: $(window).width(),
	    startX: 5000/2 - $(window).width()/2,
		startY: 5000/2 - $(window).height()/2,				   
		cssClass: "mappy"
	});
	

	var gen_nodes = function(count, name_prefix, root_node) {
		var nodes = [];
		for(var i = 1; i <= count; i++) {
			nodes[i - 1] = new Node(name_prefix + i);
            nodes[i - 1].root_node = root_node;
		}
		return nodes;
	}
	
	var node = new Node('parent');
    node.root_node = node;    
	node.state = new ExpandableState();
    node.coordinate = {location: new math.Location(0, 0)};

	var level1 = gen_nodes(15, 'level1', node);
	node.children = level1;
	
	var level2_1 = gen_nodes(14, 'level2_1', node);
	var level2_2 = gen_nodes(15, 'level2_2', node);
	var level2_3 = gen_nodes(15, 'level2_3', node);
	var level2_4 = gen_nodes(15, 'level2_4', node);
	var level2_5 = gen_nodes(30, 'level2_5', node);
	var level2_6 = gen_nodes(30, 'level2_6', node);
	var level2_7 = gen_nodes(30, 'level2_7', node);
	
	level1[2].children = level2_1;
	level1[5].children = level2_2;
	level1[10].children = level2_3;
	level1[8].children = level2_4;
	level1[6].children = level2_5;
	level1[9].children = level2_6;
	level1[1].children = level2_7;
	
	var level2_5_1 = gen_nodes(45, 'level2_5_1', node);
	level2_5[5].children = level2_5_1;

	var level2_5_1_1 = gen_nodes(30, 'level2_5_1_1', node);
	level2_5_1[5].children = level2_5_1_1;

	var level2_7_1 = gen_nodes(20, 'level2_7_1', node);
	level2_7[0].children = level2_7_1;
    
	var level2_7_1_1 = gen_nodes(27, 'level2_7_1_1', node);
	level2_7_1[5].children = level2_7_1_1;
    
    node.state.reset_state_on_click(node);
	node.relative_loc = new math.Location(slate.width / 2, slate.height / 2);
    node.state.draw(node, new math.Location(0, 0), new math.Location(slate.width / 2, slate.height / 2), new math.Location(slate.width / 2, slate.height / 2));


//	node.compute_rel_position();
//	node.assign_coordinates();
//	node.paint(new math.Location(slate.width / 2, slate.height / 2));

});

/*
 1. Mark the root node as to-be-drawn and call "2. click node"
 2. On click of a node, determine it's current state and mark its childern to-be-drawn or not and call the paint method
 3.  Paint method
 	a. Find relative position of nodes marked as to-be-drawn, so that clicked node remains in the same position
 	b. Go over the tree and draw all nodes marked as to-be-drawn
 		i. if node is leaf position and has children draw +
 		ii. if node is leaf position and has no children draw 0
 		iii. if node is leaf is not in leaf position draw -`																																																																		  
 */
